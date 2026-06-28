-- Issue #9: Migrate lifecycle RPCs from RETURNS jsonb to RETURNS TABLE(...)
--
-- Changing a function's return type requires DROP + CREATE (PostgreSQL disallows
-- CREATE OR REPLACE across a return-type change). Each function below:
--   1. Revokes grants on the old jsonb-returning signature.
--   2. Drops the old function.
--   3. Recreates with RETURNS TABLE(...) so the type generator emits precise
--      column shapes instead of the opaque Json type.
--   4. Uses RETURN QUERY SELECT ... instead of jsonb_build_object.
--   5. Re-applies the same GRANT/REVOKE pattern as the original migration.
--
-- Security, search_path, arg signatures, and all business logic are preserved
-- verbatim from the originating migrations.

-- ── 1. save_invoice_draft ─────────────────────────────────────────────────────
-- Originating migration: 20260612000002_ap14_save_invoice_draft_gst_split.sql
-- Security: SECURITY INVOKER (default, was explicit in AP-14)

REVOKE EXECUTE ON FUNCTION public.save_invoice_draft(
  uuid, uuid, uuid, text, integer, integer, integer, jsonb,
  integer, integer, integer, integer, boolean, boolean
) FROM public, anon, authenticated;

DROP FUNCTION IF EXISTS public.save_invoice_draft(
  uuid, uuid, uuid, text, integer, integer, integer, jsonb,
  integer, integer, integer, integer, boolean, boolean
);

CREATE FUNCTION public.save_invoice_draft(
  p_business_id   uuid,
  p_invoice_id    uuid     DEFAULT NULL,
  p_customer_id   uuid     DEFAULT NULL,
  p_notes         text     DEFAULT NULL,
  p_subtotal      integer  DEFAULT 0,
  p_tax_total     integer  DEFAULT 0,
  p_total         integer  DEFAULT 0,
  p_line_items    jsonb    DEFAULT '[]'::jsonb,
  p_cgst          integer  DEFAULT 0,
  p_sgst          integer  DEFAULT 0,
  p_igst          integer  DEFAULT 0,
  p_round_off     integer  DEFAULT 0,
  p_is_interstate boolean  DEFAULT false,
  p_gst_enabled   boolean  DEFAULT true
)
RETURNS TABLE(
  invoice_id    uuid,
  status        invoice_status,
  subtotal      int4,
  tax_total     int4,
  total         int4,
  cgst          int4,
  sgst          int4,
  igst          int4,
  round_off     int4,
  is_interstate boolean,
  gst_enabled   boolean,
  line_items    jsonb
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice_id  uuid;
  v_line        jsonb;
BEGIN
  -- ── Membership guard ───────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = p_business_id
      AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  IF p_invoice_id IS NULL THEN
    -- ── INSERT path: create a new draft ───────────────────────────────────────
    INSERT INTO public.invoices (
      business_id,
      customer_id,
      status,
      number,
      subtotal,
      tax_total,
      total,
      notes,
      created_by,
      cgst,
      sgst,
      igst,
      round_off,
      is_interstate,
      gst_enabled
    ) VALUES (
      p_business_id,
      p_customer_id,
      'draft',
      NULL,
      p_subtotal,
      p_tax_total,
      p_total,
      p_notes,
      (SELECT auth.uid()),
      p_cgst,
      p_sgst,
      p_igst,
      p_round_off,
      p_is_interstate,
      p_gst_enabled
    )
    RETURNING id INTO v_invoice_id;

  ELSE
    -- ── UPDATE path: validate ownership + draft status ────────────────────────
    IF NOT EXISTS (
      SELECT 1 FROM public.invoices
      WHERE id = p_invoice_id
        AND business_id = p_business_id
    ) THEN
      RAISE EXCEPTION 'invoice not found in this business';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.invoices
      WHERE id = p_invoice_id
        AND status = 'draft'
    ) THEN
      RAISE EXCEPTION 'invoice is not a draft — cannot save over a non-draft invoice';
    END IF;

    UPDATE public.invoices
    SET
      customer_id   = p_customer_id,
      subtotal      = p_subtotal,
      tax_total     = p_tax_total,
      total         = p_total,
      notes         = p_notes,
      updated_at    = now(),
      cgst          = p_cgst,
      sgst          = p_sgst,
      igst          = p_igst,
      round_off     = p_round_off,
      is_interstate = p_is_interstate,
      gst_enabled   = p_gst_enabled
    WHERE id = p_invoice_id
      AND business_id = p_business_id;

    v_invoice_id := p_invoice_id;
  END IF;

  -- ── Replace line items atomically ─────────────────────────────────────────
  DELETE FROM public.invoice_line_items
  WHERE invoice_id = v_invoice_id;

  FOR v_line IN SELECT * FROM jsonb_array_elements(p_line_items)
  LOOP
    INSERT INTO public.invoice_line_items (
      invoice_id,
      position,
      name,
      hsn_sac,
      qty,
      unit_price,
      discount,
      gst_rate,
      line_subtotal,
      line_tax,
      line_total,
      cgst,
      sgst,
      igst
    ) VALUES (
      v_invoice_id,
      (v_line->>'position')::int,
      v_line->>'name',
      NULLIF(v_line->>'hsn_sac', ''),
      (v_line->>'qty')::numeric,
      (v_line->>'unit_price')::int4,
      (v_line->>'discount')::int4,
      (v_line->>'gst_rate')::numeric,
      (v_line->>'line_subtotal')::int4,
      (v_line->>'line_tax')::int4,
      (v_line->>'line_total')::int4,
      COALESCE((v_line->>'cgst')::int4, 0),
      COALESCE((v_line->>'sgst')::int4, 0),
      COALESCE((v_line->>'igst')::int4, 0)
    );
  END LOOP;

  -- ── Return typed row ───────────────────────────────────────────────────────
  RETURN QUERY
    SELECT
      v_invoice_id,
      'draft'::invoice_status,
      p_subtotal,
      p_tax_total,
      p_total,
      p_cgst,
      p_sgst,
      p_igst,
      p_round_off,
      p_is_interstate,
      p_gst_enabled,
      COALESCE(
        (
          SELECT json_agg(
            jsonb_build_object(
              'position',      ili.position,
              'name',          ili.name,
              'hsn_sac',       ili.hsn_sac,
              'qty',           ili.qty,
              'unit_price',    ili.unit_price,
              'discount',      ili.discount,
              'gst_rate',      ili.gst_rate,
              'line_subtotal', ili.line_subtotal,
              'line_tax',      ili.line_tax,
              'line_total',    ili.line_total,
              'cgst',          ili.cgst,
              'sgst',          ili.sgst,
              'igst',          ili.igst
            )
            ORDER BY ili.position
          )::jsonb
          FROM public.invoice_line_items ili
          WHERE ili.invoice_id = v_invoice_id
        ),
        '[]'::jsonb
      );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.save_invoice_draft(
  uuid, uuid, uuid, text, integer, integer, integer, jsonb,
  integer, integer, integer, integer, boolean, boolean
) FROM public, anon;

GRANT EXECUTE ON FUNCTION public.save_invoice_draft(
  uuid, uuid, uuid, text, integer, integer, integer, jsonb,
  integer, integer, integer, integer, boolean, boolean
) TO authenticated;


-- ── 2. issue_invoice ──────────────────────────────────────────────────────────
-- Originating migration: 20260613200000_ap45_issue_invoice_plan_cap.sql
-- Security: SECURITY INVOKER (explicit in AP-45)

REVOKE EXECUTE ON FUNCTION public.issue_invoice(uuid, uuid) FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.issue_invoice(uuid, uuid);

CREATE FUNCTION public.issue_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS TABLE(
  invoice_id uuid,
  number     text,
  status     invoice_status
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice          record;
  v_number           text;
  v_plan             text;
  v_ist_month_start  date;
  v_issued_count     int;
BEGIN
  -- ── Membership guard ───────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = p_business_id
      AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── Read invoice row (ownership + existence guard) ─────────────────────────
  SELECT id, business_id, number, status, issue_date
    INTO v_invoice
    FROM invoices
   WHERE id = p_invoice_id
     AND business_id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Double-issue guard ─────────────────────────────────────────────────────
  IF v_invoice.status <> 'draft' OR v_invoice.number IS NOT NULL THEN
    RAISE EXCEPTION 'invoice is not a draft';
  END IF;

  -- ── Plan + cap check (free-tier only) ──────────────────────────────────────
  SELECT plan INTO v_plan
    FROM businesses
   WHERE id = p_business_id;

  IF v_plan IS DISTINCT FROM 'pro' THEN
    v_ist_month_start := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date;

    SELECT COUNT(*)
      INTO v_issued_count
      FROM invoices
     WHERE business_id = p_business_id
       AND sent_at IS NOT NULL
       AND (sent_at AT TIME ZONE 'Asia/Kolkata')::date >= v_ist_month_start
       AND (sent_at AT TIME ZONE 'Asia/Kolkata')::date
             < (v_ist_month_start + interval '1 month')::date;

    IF v_issued_count >= 5 THEN
      RAISE EXCEPTION 'free plan invoice cap reached';
    END IF;
  END IF;

  -- ── Draw the next invoice number ───────────────────────────────────────────
  v_number := public.next_invoice_number(p_business_id, v_invoice.issue_date);

  -- ── Transition: draft → sent ───────────────────────────────────────────────
  UPDATE invoices
     SET number     = v_number,
         status     = 'sent',
         sent_at    = now(),
         updated_at = now()
   WHERE id = p_invoice_id
     AND business_id = p_business_id
     AND status = 'draft';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice is not a draft';
  END IF;

  RETURN QUERY SELECT p_invoice_id, v_number, 'sent'::invoice_status;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.issue_invoice(uuid, uuid) FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.issue_invoice(uuid, uuid) TO authenticated;


-- ── 3. record_payment ─────────────────────────────────────────────────────────
-- Originating migration: 20260612140000_ap18_record_payment_rpc.sql
-- Security: SECURITY INVOKER (default)

REVOKE EXECUTE ON FUNCTION public.record_payment(uuid, uuid, integer, text, text, text)
  FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.record_payment(uuid, uuid, integer, text, text, text);

CREATE FUNCTION public.record_payment(
  p_business_id uuid,
  p_invoice_id  uuid,
  p_amount      integer,
  p_method      text    DEFAULT 'upi',
  p_reference   text    DEFAULT NULL,
  p_note        text    DEFAULT NULL
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
  v_new_paid     int;
  v_new_status   text;
  v_paid_at      timestamptz;
BEGIN
  -- ── Input guard ──────────────────────────────────────────────────────────────
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'payment amount must be greater than zero';
  END IF;

  -- ── Membership guard ─────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = p_business_id
      AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── Row-lock the invoice ──────────────────────────────────────────────────────
  SELECT id, business_id, status, total, amount_paid
    INTO v_invoice
    FROM invoices
   WHERE id = p_invoice_id
     AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Payable-status guard ─────────────────────────────────────────────────────
  IF v_invoice.status = 'paid' THEN
    RAISE EXCEPTION 'invoice is already paid';
  END IF;

  IF v_invoice.status NOT IN ('sent', 'viewed', 'partial', 'overdue', 'pending') THEN
    RAISE EXCEPTION 'invoice is not payable';
  END IF;

  -- ── Fresh SUM under lock ──────────────────────────────────────────────────────
  SELECT COALESCE(SUM(amount), 0)
    INTO v_current_paid
    FROM payments
   WHERE invoice_id = p_invoice_id;

  -- ── Overpayment guard ────────────────────────────────────────────────────────
  IF (v_current_paid + p_amount) > v_invoice.total THEN
    RAISE EXCEPTION 'payment would exceed invoice total (overpayment not allowed)';
  END IF;

  -- ── Insert payment row ────────────────────────────────────────────────────────
  INSERT INTO payments (
    business_id,
    invoice_id,
    amount,
    method,
    reference,
    note,
    recorded_by
  ) VALUES (
    p_business_id,
    p_invoice_id,
    p_amount,
    COALESCE(p_method, 'upi'),
    p_reference,
    p_note,
    (SELECT auth.uid())
  );

  -- ── Recompute amount_paid ─────────────────────────────────────────────────────
  SELECT COALESCE(SUM(amount), 0)
    INTO v_new_paid
    FROM payments
   WHERE invoice_id = p_invoice_id;

  -- ── Determine new status and paid_at ─────────────────────────────────────────
  IF v_new_paid >= v_invoice.total THEN
    v_new_status := 'paid';
    v_paid_at    := now();
  ELSE
    v_new_status := 'partial';
    v_paid_at    := NULL;
  END IF;

  -- ── Update the invoice ───────────────────────────────────────────────────────
  UPDATE invoices
     SET amount_paid = v_new_paid,
         status      = v_new_status::invoice_status,
         paid_at     = v_paid_at,
         updated_at  = now()
   WHERE id = p_invoice_id
     AND business_id = p_business_id;

  RETURN QUERY SELECT p_invoice_id, v_new_paid, v_new_status::invoice_status, v_paid_at;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_payment(uuid, uuid, integer, text, text, text)
  FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.record_payment(uuid, uuid, integer, text, text, text)
  TO authenticated;


-- ── 4. mark_invoice_paid ─────────────────────────────────────────────────────
-- Originating migration: 20260612150000_ap19_mark_invoice_paid_rpc.sql
-- Security: SECURITY INVOKER (default)

REVOKE EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text)
  FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.mark_invoice_paid(uuid, uuid, text);

CREATE FUNCTION public.mark_invoice_paid(
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
  IF v_invoice.status NOT IN ('sent', 'viewed', 'partial', 'overdue', 'pending') THEN
    RAISE EXCEPTION 'invoice is not payable';
  END IF;

  -- ── Fresh SUM under lock ──────────────────────────────────────────────────────
  SELECT COALESCE(SUM(amount), 0)
    INTO v_current_paid
    FROM payments
   WHERE invoice_id = p_invoice_id;

  v_outstanding := v_invoice.total - v_current_paid;

  -- ── Drift-only path: already fully covered but status not 'paid' ─────────────
  IF v_outstanding <= 0 THEN
    UPDATE invoices
       SET status     = 'paid',
           paid_at    = COALESCE(paid_at, now()),
           updated_at = now()
     WHERE id          = p_invoice_id
       AND business_id = p_business_id;

    RETURN QUERY SELECT p_invoice_id, v_current_paid, 'paid'::invoice_status, now();
    RETURN;
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

  -- ── Recompute amount_paid ─────────────────────────────────────────────────────
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

  RETURN QUERY SELECT p_invoice_id, v_new_paid, 'paid'::invoice_status, now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text) FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.mark_invoice_paid(uuid, uuid, text) TO authenticated;


-- ── 5. cancel_invoice ─────────────────────────────────────────────────────────
-- Originating migration: 20260612150001_ap19_cancel_invoice_rpc.sql
-- Security: SECURITY INVOKER (default)

REVOKE EXECUTE ON FUNCTION public.cancel_invoice(uuid, uuid) FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.cancel_invoice(uuid, uuid);

CREATE FUNCTION public.cancel_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS TABLE(
  invoice_id uuid,
  status     invoice_status
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
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

  -- ── Row-lock the invoice ──────────────────────────────────────────────────────
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
  UPDATE invoices
     SET status     = 'cancelled',
         updated_at = now()
   WHERE id          = p_invoice_id
     AND business_id = p_business_id
     AND status      = v_invoice.status;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice status changed concurrently, please retry';
  END IF;

  RETURN QUERY SELECT p_invoice_id, 'cancelled'::invoice_status;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_invoice(uuid, uuid) FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.cancel_invoice(uuid, uuid) TO authenticated;


-- ── 6. duplicate_invoice ──────────────────────────────────────────────────────
-- Originating migration: 20260612160000_ap19_duplicate_invoice_rpc.sql
-- Security: SECURITY INVOKER (default)

REVOKE EXECUTE ON FUNCTION public.duplicate_invoice(uuid, uuid) FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.duplicate_invoice(uuid, uuid);

CREATE FUNCTION public.duplicate_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS TABLE(
  invoice_id uuid,
  status     invoice_status
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_source  record;
  v_new_id  uuid;
BEGIN
  -- ── Membership guard ─────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
     WHERE business_id = p_business_id
       AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── Source-invoice existence + ownership guard ────────────────────────────────
  SELECT id, business_id, customer_id,
         gst_enabled, is_interstate, place_of_supply,
         discount, notes, terms,
         subtotal, cgst, sgst, igst, tax_total, round_off, total
    INTO v_source
    FROM invoices
   WHERE id          = p_invoice_id
     AND business_id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  v_new_id := gen_random_uuid();

  -- ── Insert new draft header ───────────────────────────────────────────────────
  INSERT INTO invoices (
    id, business_id, customer_id,
    number, status,
    gst_enabled, is_interstate, place_of_supply,
    discount, notes, terms,
    subtotal, cgst, sgst, igst, tax_total, round_off, total,
    amount_paid, paid_at, sent_at, viewed_at, public_token, pdf_url,
    issue_date, due_date,
    created_by, created_at, updated_at
  ) VALUES (
    v_new_id, p_business_id, v_source.customer_id,
    NULL, 'draft',
    v_source.gst_enabled, v_source.is_interstate, v_source.place_of_supply,
    v_source.discount, v_source.notes, v_source.terms,
    v_source.subtotal, v_source.cgst, v_source.sgst, v_source.igst,
    v_source.tax_total, v_source.round_off, v_source.total,
    0, NULL, NULL, NULL, NULL, NULL,
    CURRENT_DATE, NULL,
    (SELECT auth.uid()), now(), now()
  );

  -- ── Copy line items ───────────────────────────────────────────────────────────
  INSERT INTO invoice_line_items (
    id, invoice_id, position, name, hsn_sac,
    qty, unit_price, discount, gst_rate,
    line_subtotal, line_tax, line_total,
    cgst, sgst, igst
  )
  SELECT
    gen_random_uuid(), v_new_id, position, name, hsn_sac,
    qty, unit_price, discount, gst_rate,
    line_subtotal, line_tax, line_total,
    cgst, sgst, igst
  FROM invoice_line_items
  WHERE invoice_id = p_invoice_id;

  RETURN QUERY SELECT v_new_id, 'draft'::invoice_status;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.duplicate_invoice(uuid, uuid) FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.duplicate_invoice(uuid, uuid) TO authenticated;


-- ── 7. delete_invoice ─────────────────────────────────────────────────────────
-- Originating migration: 20260612160001_ap19_delete_invoice_rpc.sql
-- Security: SECURITY INVOKER (default)

REVOKE EXECUTE ON FUNCTION public.delete_invoice(uuid, uuid) FROM public, anon, authenticated;
DROP FUNCTION IF EXISTS public.delete_invoice(uuid, uuid);

CREATE FUNCTION public.delete_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS TABLE(
  invoice_id uuid,
  deleted    boolean
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
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

  -- ── Row-lock the invoice ──────────────────────────────────────────────────────
  SELECT id, business_id, status
    INTO v_invoice
    FROM invoices
   WHERE id          = p_invoice_id
     AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Status guard ──────────────────────────────────────────────────────────────
  IF v_invoice.status <> 'draft' THEN
    RAISE EXCEPTION 'cannot delete a non-draft invoice (cancel it instead)';
  END IF;

  -- ── Delete children first, then the invoice row ───────────────────────────────
  DELETE FROM invoice_line_items
   WHERE invoice_id = p_invoice_id;

  DELETE FROM invoices
   WHERE id          = p_invoice_id
     AND business_id = p_business_id;

  RETURN QUERY SELECT p_invoice_id, TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_invoice(uuid, uuid) FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.delete_invoice(uuid, uuid) TO authenticated;
