-- AP-28: mark_email_status RPC
--
-- Purpose: Supabase-side handler for the Resend email-delivery webhook.
--   Receives a provider_msg_id and a status string ('delivered', 'opened',
--   'bounced') from /api/email/webhook; updates message_log with a no-downgrade
--   guard; and:
--     - When status = 'opened': transitions the linked invoice from 'sent' →
--       'viewed', exactly mirroring mark_message_status on 'read' (AP-26).
--     - When status = 'bounced': sets message_log.status = 'failed' (terminal)
--       and inserts a notifications row for the business owner naming the
--       customer + invoice number.
--
-- No new index needed: the global partial unique index
-- message_log_provider_msg_id_idx (provider_msg_id IS NOT NULL, already created
-- in AP-26) supports the O(1) lookup here for ALL channels including email.
--
-- No-downgrade guard: numeric rank (sent=1, delivered=2, opened=3).
--   'bounced' bypasses the rank guard and always sets status='failed' — a bounce
--   is a terminal delivery failure, not a progression, and must always be recorded.
--
-- Bounce notification: inserted INSIDE the RPC (transactional with the status
--   update) for the business owner (businesses.owner_id). The notification names
--   the customer and invoice number so the owner can act.
--
-- Invoice transition: status='sent' AND viewed_at IS NULL guard means paid,
--   partial, overdue, cancelled, or already-viewed invoices are never re-touched.
--
-- Security design: SECURITY DEFINER with search_path locked.
--   Called exclusively by the webhook route handler via the admin/service-role
--   client. REVOKE from PUBLIC, anon, authenticated.
--
-- Returns: jsonb { message_found: bool, invoice_transitioned: bool }

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
    RETURN jsonb_build_object('message_found', false, 'invoice_transitioned', false);
  END IF;

  -- Locate the message_log row (uses the global partial unique index).
  SELECT id, invoice_id, business_id
    INTO v_message_log_id, v_invoice_id, v_business_id
    FROM public.message_log
   WHERE provider_msg_id = p_provider_msg_id;

  -- Unknown provider_msg_id — the webhook may reference a message we did not
  -- send. Log and skip, never error.
  IF NOT FOUND THEN
    RETURN jsonb_build_object('message_found', false, 'invoice_transitioned', false);
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

    RETURN jsonb_build_object('message_found', true, 'invoice_transitioned', false);
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
    'invoice_transitioned', v_inv_transitioned
  );
END;
$function$;

-- ── Grants ────────────────────────────────────────────────────────────────────
-- service_role only — called exclusively by the server-side webhook route handler
-- (admin client). anon and authenticated must never drive invoice status
-- transitions or insert notifications directly.
GRANT EXECUTE ON FUNCTION public.mark_email_status(text, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.mark_email_status(text, text)
  FROM PUBLIC, anon, authenticated;
