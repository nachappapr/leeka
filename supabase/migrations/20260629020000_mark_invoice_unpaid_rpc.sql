-- Issue #18 — mark_invoice_unpaid RPC (manual-only, confirmed, status-honest).
--
-- Reverses a manually paid invoice back to the appropriate unpaid status.
-- Guards:
--   • Membership guard: caller must be a member of p_business_id.
--   • Status guard: invoice must currently be 'paid'. Idempotent against
--     double-tap / stale UI (distinct error: 'not paid').
--   • Gateway guard: any payment row with source='gateway' blocks the reversal
--     (distinct error: 'gateway payment'). Gateway-confirmed payments are
--     non-undoable by design.
--
-- On success:
--   • DELETE manual payment rows (source='manual') for the invoice.
--   • UPDATE invoices: amount_paid=0, paid_at=NULL, status=<recomputed>.
--   • Recomputed status (from current reality, not a stored prior state):
--       overdue  — due_date < IST calendar today (same boundary as sweep RPC)
--       viewed   — invoices.viewed_at IS NOT NULL (equivalent to "a viewed event
--                  exists"; viewed_at is stamped by the same trigger that emits
--                  the 'viewed' invoice_event, so either is authoritative;
--                  viewed_at avoids an extra subquery on invoice_events)
--       sent     — otherwise
--   • INSERT 'unpaid' invoice_event carrying prior amount + recomputed status.
--
-- Column-qualification rule (issue #9 / 42702 precedent): RETURNS TABLE OUT
-- columns invoice_id and status enter the PL/pgSQL variable scope, so every
-- column reference inside FROM-clause queries is table-qualified to avoid
-- ambiguity. The row-lock result lands in v_invoice (a record variable), so
-- v_invoice.status / v_invoice.due_date etc. are unambiguous.
--
-- SECURITY INVOKER (matches mark_invoice_paid). Caller must be authenticated
-- and a member of the business; RLS on invoices + payments enforces row-level
-- tenant isolation on top of the membership guard.

CREATE OR REPLACE FUNCTION public.mark_invoice_unpaid(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS TABLE(
  invoice_id  uuid,
  status      invoice_status
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice       record;
  v_has_gateway   boolean;
  v_prior_paid    int;
  v_ist_today     date;
  v_new_status    invoice_status;
BEGIN
  -- ── Membership guard ─────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
     WHERE business_members.business_id = p_business_id
       AND business_members.user_id     = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── Row-lock the invoice ──────────────────────────────────────────────────────
  -- Table-qualify all column refs to avoid 42702 with OUT col names (invoice_id,
  -- status). v_invoice.* dereferences are record-qualified and unambiguous.
  SELECT invoices.id,
         invoices.business_id,
         invoices.status,
         invoices.amount_paid,
         invoices.due_date,
         invoices.viewed_at
    INTO v_invoice
    FROM invoices
   WHERE invoices.id          = p_invoice_id
     AND invoices.business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Status guard: must currently be paid ─────────────────────────────────────
  IF v_invoice.status <> 'paid' THEN
    RAISE EXCEPTION 'invoice is not paid';
  END IF;

  -- ── Gateway guard: any gateway payment blocks the reversal ───────────────────
  -- Gateway-confirmed payments are non-undoable; only source='manual' rows
  -- may be reversed. If even one gateway row exists, raise immediately.
  SELECT EXISTS(
    SELECT 1 FROM payments
     WHERE payments.invoice_id  = p_invoice_id
       AND payments.business_id = p_business_id
       AND payments.source      = 'gateway'
  ) INTO v_has_gateway;

  IF v_has_gateway THEN
    RAISE EXCEPTION 'cannot reverse a gateway payment';
  END IF;

  -- ── Capture prior amount_paid for the event meta ──────────────────────────────
  v_prior_paid := v_invoice.amount_paid;

  -- ── Delete manual payment rows ────────────────────────────────────────────────
  -- At this point we know no gateway rows exist, so deleting source='manual'
  -- removes all payment rows for the invoice.
  DELETE FROM payments
   WHERE payments.invoice_id  = p_invoice_id
     AND payments.business_id = p_business_id
     AND payments.source      = 'manual';

  -- ── Recompute status from current reality ─────────────────────────────────────
  -- IST boundary mirrors sweep_overdue_invoices: due_date < IST calendar today
  -- means "strictly before IST today", so due today is NOT yet overdue.
  v_ist_today := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  IF v_invoice.due_date IS NOT NULL AND v_invoice.due_date < v_ist_today THEN
    v_new_status := 'overdue';
  ELSIF v_invoice.viewed_at IS NOT NULL THEN
    v_new_status := 'viewed';
  ELSE
    v_new_status := 'sent';
  END IF;

  -- ── Reset invoice to unpaid state ─────────────────────────────────────────────
  -- Table-qualify invoices.id/business_id in WHERE to avoid OUT-col ambiguity.
  UPDATE invoices
     SET amount_paid = 0,
         paid_at     = NULL,
         status      = v_new_status,
         updated_at  = now()
   WHERE invoices.id          = p_invoice_id
     AND invoices.business_id = p_business_id;

  -- ── Emit 'unpaid' invoice_event ───────────────────────────────────────────────
  -- meta carries: prior amount reversed, the recomputed status, and source='manual'
  -- (mirrors the source convention used in other event rows).
  INSERT INTO public.invoice_events (business_id, invoice_id, type, meta)
  VALUES (
    p_business_id,
    p_invoice_id,
    'unpaid',
    jsonb_build_object(
      'prior_amount_paid', v_prior_paid,
      'recomputed_status', v_new_status::text,
      'source',            'manual'
    )
  );

  RETURN QUERY SELECT p_invoice_id, v_new_status;
END;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────────
-- Mirrors mark_invoice_paid: authenticated callers only. Public / anon are blocked.
-- REVOKE FROM anon is explicit (not just PUBLIC): CREATE OR REPLACE preserves any
-- pre-existing grants, so an explicit anon revoke makes the end state deterministic.
REVOKE EXECUTE ON FUNCTION public.mark_invoice_unpaid(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mark_invoice_unpaid(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.mark_invoice_unpaid(uuid, uuid) TO authenticated;
