-- AP-26/AP-28 follow-up: extend mark_message_status + mark_email_status to
-- return business_id in their jsonb result.
--
-- Motivation: the WhatsApp and email webhook route handlers call these RPCs to
-- transition invoice status → 'viewed', but the existing result shape omits
-- business_id. Without it the handlers cannot call revalidateBusiness(id) to
-- bust the cached invoices list, status counts, and dashboard for the affected
-- tenant. This additive-only change adds business_id (uuid | null) to the
-- returned jsonb — null when message_found=false (unknown provider_msg_id).
--
-- Additive-only: message_found and invoice_transitioned are preserved
-- byte-for-byte. Security mode, grants, and search_path are unchanged.

-- ── mark_message_status (AP-26) ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_message_status(p_provider_msg_id text, p_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_message_log_id   uuid;
  v_invoice_id       uuid;
  v_business_id      uuid;
  v_rows             integer;
  v_inv_transitioned boolean := false;

  -- Numeric rank for the no-downgrade guard.
  -- Higher rank = further along in the status progression.
  v_current_rank     integer;
  v_incoming_rank    integer;
BEGIN
  -- Reject null/empty provider_msg_id immediately.
  IF p_provider_msg_id IS NULL OR p_provider_msg_id = '' THEN
    RETURN jsonb_build_object(
      'message_found',        false,
      'invoice_transitioned', false,
      'business_id',          NULL
    );
  END IF;

  -- Locate the message_log row (uses the partial unique index).
  SELECT id, invoice_id, business_id
    INTO v_message_log_id, v_invoice_id, v_business_id
    FROM public.message_log
   WHERE provider_msg_id = p_provider_msg_id;

  -- Unknown provider_msg_id — the webhook may reference a message we did not
  -- send (e.g. a non-invoice WhatsApp message). Log and skip, never error.
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'message_found',        false,
      'invoice_transitioned', false,
      'business_id',          NULL
    );
  END IF;

  -- ── No-downgrade guard ───────────────────────────────────────────────────
  -- Assign a numeric rank to each status so we can compare progression.
  -- Statuses outside this set (e.g. 'queued', 'skipped', 'failed') start at 0
  -- and can always be overwritten by any delivery status.
  SELECT CASE status
           WHEN 'sent'      THEN 1
           WHEN 'delivered' THEN 2
           WHEN 'read'      THEN 3
           ELSE 0
         END
    INTO v_current_rank
    FROM public.message_log
   WHERE id = v_message_log_id;

  v_incoming_rank := CASE p_status
                       WHEN 'sent'      THEN 1
                       WHEN 'delivered' THEN 2
                       WHEN 'read'      THEN 3
                       ELSE 0
                     END;

  -- Only update when the incoming status is strictly ahead of current.
  -- A 'delivered' arriving after 'read' (incoming_rank 2 < current_rank 3) is a no-op.
  IF v_incoming_rank > v_current_rank THEN
    UPDATE public.message_log
       SET status     = p_status,
           updated_at = now()
     WHERE id = v_message_log_id;
  END IF;

  -- ── Read → viewed transition ─────────────────────────────────────────────
  -- Only when the status is 'read' AND the invoice is linked.
  -- Mirrors get_public_invoice exactly: guard by status='sent' AND viewed_at IS NULL
  -- so whichever source fires first wins; the second call is a harmless no-op.
  -- Does NOT transition invoices that are paid/partial/overdue/cancelled/viewed
  -- — the WHERE clause on status='sent' handles all those cases.
  IF p_status = 'read' AND v_invoice_id IS NOT NULL THEN
    UPDATE public.invoices
       SET status    = 'viewed',
           viewed_at = now()
     WHERE id        = v_invoice_id
       AND status    = 'sent'
       AND viewed_at IS NULL;

    GET DIAGNOSTICS v_rows = ROW_COUNT;

    -- Only insert the event when a row was actually transitioned (idempotent).
    IF v_rows > 0 THEN
      INSERT INTO public.invoice_events (business_id, invoice_id, type, channel)
      VALUES (v_business_id, v_invoice_id, 'viewed', 'whatsapp');

      v_inv_transitioned := true;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'message_found',        true,
    'invoice_transitioned', v_inv_transitioned,
    'business_id',          v_business_id
  );
END;
$function$;

-- Grants unchanged from AP-26.
GRANT EXECUTE ON FUNCTION public.mark_message_status(text, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.mark_message_status(text, text)
  FROM PUBLIC, anon, authenticated;

-- ── mark_email_status (AP-28) ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_email_status(p_provider_msg_id text, p_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_message_log_id   uuid;
  v_invoice_id       uuid;
  v_business_id      uuid;
  v_rows             integer;
  v_inv_transitioned boolean := false;

  -- Numeric rank for the no-downgrade guard (progression statuses only).
  -- 'bounced' bypasses this guard — it is always written as 'failed'.
  v_current_rank     integer;
  v_incoming_rank    integer;

  -- For bounce notification lookup.
  v_owner_id         uuid;
  v_invoice_number   text;
  v_customer_name    text;
BEGIN
  -- Reject null/empty provider_msg_id immediately.
  IF p_provider_msg_id IS NULL OR p_provider_msg_id = '' THEN
    RETURN jsonb_build_object(
      'message_found',        false,
      'invoice_transitioned', false,
      'business_id',          NULL
    );
  END IF;

  -- Locate the message_log row (uses the global partial unique index).
  SELECT id, invoice_id, business_id
    INTO v_message_log_id, v_invoice_id, v_business_id
    FROM public.message_log
   WHERE provider_msg_id = p_provider_msg_id;

  -- Unknown provider_msg_id — the webhook may reference a message we did not
  -- send. Log and skip, never error.
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'message_found',        false,
      'invoice_transitioned', false,
      'business_id',          NULL
    );
  END IF;

  -- ── Bounce: terminal path ────────────────────────────────────────────────
  -- A bounce is a permanent delivery failure. Skip the rank guard — always
  -- record 'failed'. Then insert a notification for the business owner.
  IF p_status = 'bounced' THEN
    UPDATE public.message_log
       SET status     = 'failed',
           updated_at = now()
     WHERE id = v_message_log_id;

    -- Look up owner, invoice number, and customer name for the notification body.
    SELECT b.owner_id,
           COALESCE(i.number, i.id::text),
           COALESCE(c.name, 'Unknown customer')
      INTO v_owner_id, v_invoice_number, v_customer_name
      FROM public.businesses b
      LEFT JOIN public.invoices  i ON i.id = v_invoice_id
      LEFT JOIN public.customers c ON c.id = i.customer_id
     WHERE b.id = v_business_id;

    IF v_owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (business_id, user_id, type, title, body, link, read)
      VALUES (
        v_business_id,
        v_owner_id,
        'email_bounce',
        'Email bounced — ' || v_invoice_number,
        'Email to ' || v_customer_name || ' for invoice ' || v_invoice_number
          || ' was not delivered (bounce). Please check the customer''s email address.',
        CASE WHEN v_invoice_id IS NOT NULL
             THEN '/invoices/' || v_invoice_id::text
             ELSE NULL
        END,
        false
      );
    END IF;

    RETURN jsonb_build_object(
      'message_found',        true,
      'invoice_transitioned', false,
      'business_id',          v_business_id
    );
  END IF;

  -- ── No-downgrade guard (for delivered / opened) ──────────────────────────
  -- Assign a numeric rank so out-of-order status callbacks are silently ignored.
  SELECT CASE status
           WHEN 'sent'      THEN 1
           WHEN 'delivered' THEN 2
           WHEN 'opened'    THEN 3
           ELSE 0
         END
    INTO v_current_rank
    FROM public.message_log
   WHERE id = v_message_log_id;

  v_incoming_rank := CASE p_status
                       WHEN 'sent'      THEN 1
                       WHEN 'delivered' THEN 2
                       WHEN 'opened'    THEN 3
                       ELSE 0
                     END;

  -- Only update when the incoming status is strictly ahead of current.
  IF v_incoming_rank > v_current_rank THEN
    UPDATE public.message_log
       SET status     = p_status,
           updated_at = now()
     WHERE id = v_message_log_id;
  END IF;

  -- ── Opened → viewed transition ───────────────────────────────────────────
  -- Mirror of AP-26 mark_message_status 'read' branch.
  -- Only when status is 'opened' AND the invoice is linked.
  -- Guard by status='sent' AND viewed_at IS NULL — whichever source fires first
  -- wins; the second call is a harmless no-op.
  IF p_status = 'opened' AND v_invoice_id IS NOT NULL THEN
    UPDATE public.invoices
       SET status    = 'viewed',
           viewed_at = now()
     WHERE id        = v_invoice_id
       AND status    = 'sent'
       AND viewed_at IS NULL;

    GET DIAGNOSTICS v_rows = ROW_COUNT;

    IF v_rows > 0 THEN
      INSERT INTO public.invoice_events (business_id, invoice_id, type, channel)
      VALUES (v_business_id, v_invoice_id, 'viewed', 'email');

      v_inv_transitioned := true;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'message_found',        true,
    'invoice_transitioned', v_inv_transitioned,
    'business_id',          v_business_id
  );
END;
$function$;

-- Grants unchanged from AP-28.
GRANT EXECUTE ON FUNCTION public.mark_email_status(text, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.mark_email_status(text, text)
  FROM PUBLIC, anon, authenticated;
