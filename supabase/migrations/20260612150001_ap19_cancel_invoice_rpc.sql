-- AP-19 Unit 1: cancel_invoice RPC
--
-- Transitions an invoice to 'cancelled' atomically:
--   1. Membership + row-lock guards (mirrors issue_invoice).
--   2. Status guards: disallows draft (delete instead), paid (not reversible
--      without a refund), already-cancelled (idempotent-reject).
--   3. Allowed source set: sent, viewed, partial, overdue, pending.
--   4. Guarded UPDATE with the source status in the WHERE clause to detect
--      a concurrent transition between the SELECT FOR UPDATE and UPDATE
--      (mirrors issue_invoice's post-UPDATE NOT FOUND guard).
--   5. Does NOT touch amount_paid or payments — cancel is not a refund.
--   6. Returns jsonb { invoice_id, status }.
--
-- Note: The PRD does not explicitly list the allowed source set for cancel.
-- The implemented set (sent, viewed, partial, overdue, pending) matches the
-- payable set from record_payment/mark_invoice_paid. This is the most
-- conservative interpretation: any invoice that has been issued but not yet
-- settled can be cancelled. Drafts must be deleted (Unit 2). Paid invoices
-- require a refund workflow (out of scope AP-19).

CREATE OR REPLACE FUNCTION public.cancel_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_invoice record;
BEGIN
  -- ── Membership guard ─────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
     WHERE business_id = p_business_id
       AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── Row-lock the invoice: ownership + existence guard ─────────────────────────
  SELECT id, business_id, status
    INTO v_invoice
    FROM invoices
   WHERE id          = p_invoice_id
     AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Status guards ─────────────────────────────────────────────────────────────
  IF v_invoice.status = 'draft' THEN
    RAISE EXCEPTION 'cannot cancel a draft (delete it instead)';
  END IF;

  IF v_invoice.status = 'paid' THEN
    RAISE EXCEPTION 'cannot cancel a paid invoice';
  END IF;

  IF v_invoice.status = 'cancelled' THEN
    RAISE EXCEPTION 'invoice is already cancelled';
  END IF;

  -- ── Transition: → cancelled ───────────────────────────────────────────────────
  -- WHERE clause includes the pre-lock status so a concurrent transition
  -- (e.g., mark_invoice_paid racing with cancel_invoice) causes 0 rows affected,
  -- which is caught by the NOT FOUND guard below. Does NOT touch amount_paid or
  -- payments — cancel is not a refund.
  UPDATE invoices
     SET status     = 'cancelled',
         updated_at = now()
   WHERE id          = p_invoice_id
     AND business_id = p_business_id
     AND status      = v_invoice.status;

  -- Guard: 0 rows means a concurrent transition changed the status between our
  -- SELECT FOR UPDATE and this UPDATE (shouldn't happen with a proper FOR UPDATE,
  -- but the guard mirrors issue_invoice's defensive pattern).
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice status changed concurrently, please retry';
  END IF;

  RETURN jsonb_build_object(
    'invoice_id', p_invoice_id,
    'status',     'cancelled'
  );
END;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.cancel_invoice(uuid, uuid)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.cancel_invoice(uuid, uuid)
  FROM PUBLIC, anon;
