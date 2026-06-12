-- AP-19 Unit 1: mark_invoice_paid RPC
--
-- Settles an invoice fully in one atomic call:
--   1. Membership + row-lock guards (mirrors record_payment).
--   2. Idempotent-reject: already-paid is detected before any DML.
--   3. Payable-status guard: same allowed set as record_payment.
--   4. Computes outstanding = total - fresh SUM(payments) UNDER THE LOCK
--      (never the stored amount_paid column, immune to drift).
--   5. If outstanding <= 0 (already fully covered, status drift only):
--      updates status/paid_at, inserts no payment row.
--   6. If outstanding > 0: inserts one payment row for exactly `outstanding`,
--      then recomputes the SUM and updates amount_paid + status + paid_at.
--   7. Returns jsonb { invoice_id, amount_paid, status, paid_at }.
--
-- Concurrency: FOR UPDATE on the invoice row is the same lock used by
-- record_payment. A concurrent mark_invoice_paid (or record_payment) must
-- wait for this transaction to commit before it can read the payments SUM,
-- so the second caller sees the first caller's payment row and either sees
-- outstanding = 0 (drift-only path, no duplicate INSERT) or the correct
-- remaining amount. Two callers can never both INSERT the full outstanding.

CREATE OR REPLACE FUNCTION public.mark_invoice_paid(
  p_business_id uuid,
  p_invoice_id  uuid,
  p_method      text DEFAULT 'upi'
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_invoice      record;
  v_current_paid int;
  v_outstanding  int;
  v_new_paid     int;
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
  -- FOR UPDATE prevents concurrent mark_invoice_paid / record_payment from
  -- both passing the guard and over-collecting in the same window.
  SELECT id, business_id, status, total, amount_paid
    INTO v_invoice
    FROM invoices
   WHERE id          = p_invoice_id
     AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Idempotent-reject: already paid ──────────────────────────────────────────
  IF v_invoice.status = 'paid' THEN
    RAISE EXCEPTION 'invoice is already paid';
  END IF;

  -- ── Payable-status guard ──────────────────────────────────────────────────────
  -- Allowed: sent, viewed, partial, overdue, pending
  -- draft   → not payable (must be issued first)
  -- cancelled → not payable
  IF v_invoice.status NOT IN ('sent', 'viewed', 'partial', 'overdue', 'pending') THEN
    RAISE EXCEPTION 'invoice is not payable';
  END IF;

  -- ── Fresh SUM under lock ──────────────────────────────────────────────────────
  -- The invoice row is now locked; this SUM is consistent with the lock.
  -- Any concurrent payment INSERT must wait until this transaction commits,
  -- so this value is authoritative for both the outstanding computation and
  -- the final amount_paid update.
  SELECT COALESCE(SUM(amount), 0)
    INTO v_current_paid
    FROM payments
   WHERE invoice_id = p_invoice_id;

  v_outstanding := v_invoice.total - v_current_paid;

  -- ── Drift-only path: already fully covered but status not 'paid' ─────────────
  -- outstanding <= 0 means a prior payment (possibly from record_payment) already
  -- covered the total but the status column was not updated (data drift).
  -- Correct the status without inserting a duplicate payment row.
  IF v_outstanding <= 0 THEN
    UPDATE invoices
       SET status     = 'paid',
           paid_at    = COALESCE(paid_at, now()),
           updated_at = now()
     WHERE id          = p_invoice_id
       AND business_id = p_business_id;

    RETURN jsonb_build_object(
      'invoice_id',  p_invoice_id,
      'amount_paid', v_current_paid,
      'status',      'paid',
      'paid_at',     now()
    );
  END IF;

  -- ── Insert one payment row for exactly the outstanding amount ─────────────────
  INSERT INTO payments (
    business_id,
    invoice_id,
    amount,
    method,
    recorded_by
  ) VALUES (
    p_business_id,
    p_invoice_id,
    v_outstanding,
    COALESCE(p_method, 'upi'),
    (SELECT auth.uid())
  );

  -- ── Recompute amount_paid from the table — NEVER stale-column arithmetic ──────
  SELECT COALESCE(SUM(amount), 0)
    INTO v_new_paid
    FROM payments
   WHERE invoice_id = p_invoice_id;

  -- ── Settle the invoice ────────────────────────────────────────────────────────
  UPDATE invoices
     SET amount_paid = v_new_paid,
         status      = 'paid',
         paid_at     = now(),
         updated_at  = now()
   WHERE id          = p_invoice_id
     AND business_id = p_business_id;

  RETURN jsonb_build_object(
    'invoice_id',  p_invoice_id,
    'amount_paid', v_new_paid,
    'status',      'paid',
    'paid_at',     now()
  );
END;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text)
  FROM PUBLIC, anon;
