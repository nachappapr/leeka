-- Issue #17 — payment source tracking + paid-event source (DB foundation slice of #16).
--
-- 1. Adds payments.source (text NOT NULL DEFAULT 'manual', CHECK IN ('manual','gateway')).
--    The DEFAULT backfills every existing row to 'manual'; the explicit UPDATE below
--    is a no-op in practice but makes the backfill auditable in migration history.
-- 2. Makes mark_invoice_paid set source = 'manual' on the payment row it inserts.
-- 3. Enriches the existing AP-32 trigger emit_paid_invoice_event so the single 'paid'
--    invoice_events row it emits carries meta.source (read from the most-recent payment),
--    alongside the existing meta.invoice_number / meta.total keys.
--
-- Single-producer by design: the trigger is the sole emitter of 'paid' events. The RPC
-- does NOT emit the event itself (a previous attempt that emitted from both the RPC and
-- the trigger double-counted the event and its notification fan-out). Reading source from
-- payments inside the trigger is also gateway-ready: a future webhook that flips an invoice
-- to 'paid' with a source='gateway' payment yields meta.source='gateway' with no RPC change.
--
-- Column-qualification rule (issue #9 / 42702 precedent): the RETURNS TABLE OUT column
-- names — invoice_id, amount_paid, status, paid_at — enter the PL/pgSQL variable scope, so
-- every column reference in a FROM-clause query inside mark_invoice_paid is table-qualified.

-- ── 1. Add source column to payments ────────────────────────────────────────────

ALTER TABLE public.payments
  ADD COLUMN source text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'gateway'));

-- Explicit backfill for audit clarity; the DEFAULT on ADD COLUMN already set every
-- pre-existing row, so this matches zero rows in practice.
UPDATE public.payments
   SET source = 'manual'
 WHERE source IS NULL;


-- ── 2. emit_paid_invoice_event: include source in the emitted event ─────────────
-- Preserves SECURITY DEFINER, SET search_path, and trigger wiring from AP-32; adds
-- only the source lookup and the 'source' meta key. The existing REVOKEs are retained
-- by CREATE OR REPLACE (replacing a function body does not reset its grants).

CREATE OR REPLACE FUNCTION public.emit_paid_invoice_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_source text;
BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
    -- Most-recent payment source. COALESCE to 'manual' for the drift-only path /
    -- zero-payment edge where the lookup returns no row.
    SELECT payments.source
      INTO v_source
      FROM payments
     WHERE payments.invoice_id = NEW.id
     ORDER BY payments.paid_at DESC NULLS LAST
     LIMIT 1;

    INSERT INTO public.invoice_events (business_id, invoice_id, type, meta)
    VALUES (
      NEW.business_id,
      NEW.id,
      'paid',
      jsonb_build_object(
        'invoice_number', COALESCE(NEW.number, NEW.id::text),
        'total',          NEW.total,
        'source',         COALESCE(v_source, 'manual')
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


-- ── 3. mark_invoice_paid: set payments.source = 'manual' ─────────────────────────
-- The only behavioural change vs. the prior definition is source = 'manual' on the
-- payment insert. Event emission stays with the trigger. Arg signature, RETURNS TABLE
-- shape, SECURITY INVOKER, search_path, membership guard, row lock, SUM recompute, and
-- grants are unchanged.

CREATE OR REPLACE FUNCTION public.mark_invoice_paid(
  p_business_id uuid,
  p_invoice_id  uuid,
  p_method      text DEFAULT 'upi'
)
RETURNS TABLE(
  invoice_id  uuid,
  amount_paid int4,
  status      invoice_status,
  paid_at     timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
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

  -- ── Row-lock the invoice ──────────────────────────────────────────────────────
  -- Qualify invoices.status, invoices.amount_paid to avoid ambiguity with OUT cols.
  SELECT invoices.id, invoices.business_id, invoices.status, invoices.total,
         invoices.amount_paid
    INTO v_invoice
    FROM invoices
   WHERE invoices.id          = p_invoice_id
     AND invoices.business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Idempotent-reject: already paid ──────────────────────────────────────────
  IF v_invoice.status = 'paid' THEN
    RAISE EXCEPTION 'invoice is already paid';
  END IF;

  -- ── Payable-status guard ──────────────────────────────────────────────────────
  IF v_invoice.status NOT IN ('sent', 'viewed', 'partial', 'overdue', 'pending') THEN
    RAISE EXCEPTION 'invoice is not payable';
  END IF;

  -- ── Fresh SUM under lock ──────────────────────────────────────────────────────
  -- Qualify payments.invoice_id to avoid ambiguity with OUT col invoice_id.
  SELECT COALESCE(SUM(amount), 0)
    INTO v_current_paid
    FROM payments
   WHERE payments.invoice_id = p_invoice_id;

  v_outstanding := v_invoice.total - v_current_paid;

  -- ── Drift-only path: payments already cover total but status ≠ 'paid' ─────────
  IF v_outstanding <= 0 THEN
    -- Qualify invoices.paid_at in COALESCE value to avoid ambiguity with OUT col paid_at.
    UPDATE invoices
       SET status     = 'paid',
           paid_at    = COALESCE(invoices.paid_at, now()),
           updated_at = now()
     WHERE invoices.id          = p_invoice_id
       AND invoices.business_id = p_business_id;
    -- trg_emit_paid_invoice_event fires here and emits the paid event.

    RETURN QUERY SELECT p_invoice_id, v_current_paid, 'paid'::invoice_status, now();
    RETURN;
  END IF;

  -- ── Insert one payment row for exactly the outstanding amount ─────────────────
  INSERT INTO payments (
    business_id,
    invoice_id,
    amount,
    method,
    recorded_by,
    source
  ) VALUES (
    p_business_id,
    p_invoice_id,
    v_outstanding,
    COALESCE(p_method, 'upi'),
    (SELECT auth.uid()),
    'manual'
  );

  -- ── Recompute amount_paid ─────────────────────────────────────────────────────
  -- Qualify payments.invoice_id to avoid ambiguity with OUT col invoice_id.
  SELECT COALESCE(SUM(amount), 0)
    INTO v_new_paid
    FROM payments
   WHERE payments.invoice_id = p_invoice_id;

  -- ── Settle the invoice ────────────────────────────────────────────────────────
  UPDATE invoices
     SET amount_paid = v_new_paid,
         status      = 'paid',
         paid_at     = now(),
         updated_at  = now()
   WHERE invoices.id          = p_invoice_id
     AND invoices.business_id = p_business_id;
  -- trg_emit_paid_invoice_event fires here and emits the paid event.

  RETURN QUERY SELECT p_invoice_id, v_new_paid, 'paid'::invoice_status, now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text) FROM PUBLIC;
