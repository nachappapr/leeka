-- AP-26: mark_message_status RPC + partial unique index
--
-- Purpose: Supabase-side handler for the WhatsApp delivery-status webhook.
--   Receives a provider_msg_id and a status string ('sent', 'delivered', 'read')
--   from the /api/webhooks/whatsapp route handler; updates message_log with a
--   no-downgrade guard; and, when status = 'read', transitions the linked invoice
--   from 'sent' → 'viewed' (idempotent — whichever source fires first wins).
--
-- Partial unique index: message_log_provider_msg_id_idx
--   Indexes only rows where provider_msg_id IS NOT NULL, keeping the index small.
--   Supports the O(1) lookup inside mark_message_status without indexing the many
--   NULL rows that exist before WhatsApp assigns a message ID.
--
-- No-downgrade guard: numeric rank (sent=1, delivered=2, read=3, else=0).
--   A status with a lower rank arriving out-of-order is silently ignored — the
--   message_log row stays at the higher (further-progressed) status.
--
-- Invoice transition: status='sent' AND viewed_at IS NULL guard means paid,
--   partial, overdue, cancelled, or already-viewed invoices are never re-touched.
--
-- Security design: SECURITY DEFINER with search_path locked.
--   The RPC joins message_log, invoices, and invoice_events. Because the invoking
--   role (service_role, via the webhook route handler) bypasses RLS anyway, DEFINER
--   vs INVOKER is moot in practice — but DEFINER is chosen to document the intent
--   that this function always operates with owner privileges regardless of caller.
--   REVOKE from PUBLIC, anon, authenticated so only the server-side webhook path
--   (via the admin client) can execute it.
--
-- Returns: jsonb { message_found: bool, invoice_transitioned: bool }

-- ── Partial unique index ─────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS message_log_provider_msg_id_idx
  ON public.message_log USING btree (provider_msg_id)
  WHERE (provider_msg_id IS NOT NULL);

-- ── RPC body ─────────────────────────────────────────────────────────────────
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
    RETURN jsonb_build_object('message_found', false, 'invoice_transitioned', false);
  END IF;

  -- Locate the message_log row (uses the new partial unique index).
  SELECT id, invoice_id, business_id
    INTO v_message_log_id, v_invoice_id, v_business_id
    FROM public.message_log
   WHERE provider_msg_id = p_provider_msg_id;

  -- Unknown provider_msg_id — the webhook may reference a message we did not
  -- send (e.g. a non-invoice WhatsApp message). Log and skip, never error.
  IF NOT FOUND THEN
    RETURN jsonb_build_object('message_found', false, 'invoice_transitioned', false);
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
    'invoice_transitioned', v_inv_transitioned
  );
END;
$function$;

-- ── Grants ─────────────────────────────────────────────────────────────────
-- service_role only — called exclusively by the server-side webhook route handler
-- (admin client). anon and authenticated must never be able to drive invoice
-- status transitions directly.
GRANT EXECUTE ON FUNCTION public.mark_message_status(text, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.mark_message_status(text, text)
  FROM PUBLIC, anon, authenticated;
