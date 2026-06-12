-- AP-19 Unit 2: duplicate_invoice RPC
--
-- Clones any invoice (any status) into a fresh DRAFT:
--   1. Membership guard (mirrors cancel_invoice).
--   2. Source-invoice existence + ownership guard (SELECT only — no FOR UPDATE
--      since the source is read-only; atomicity of the resulting INSERTs is
--      guaranteed by the surrounding transaction).
--   3. Copies header fields verbatim (customer_id, GST flags, totals, notes,
--      terms, place_of_supply, discount).
--   4. Resets lifecycle fields: number → NULL, status → 'draft', amount_paid → 0,
--      paid_at/sent_at/viewed_at/public_token/pdf_url → NULL, issue_date →
--      CURRENT_DATE, due_date → NULL.  id, created_at, updated_at → fresh values.
--   5. Copies all invoice_line_items rows verbatim (position, name, hsn_sac,
--      qty, unit_price, discount, gst_rate, and all computed amounts).
--   6. Does NOT copy payments or invoice_events rows.
--   7. Returns jsonb { invoice_id (new draft id), status: 'draft' }.
--
-- Note: totals (subtotal, cgst, sgst, igst, tax_total, round_off, total) are
-- copied verbatim from the source because line items are copied verbatim.
-- The copied totals remain internally consistent with the copied lines.
-- Recomputation is left to save_invoice_draft when the user edits the clone.

CREATE OR REPLACE FUNCTION public.duplicate_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
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
  -- No FOR UPDATE: the source invoice is only read; the new INSERT is atomic
  -- within this transaction.  Any status is allowed — duplicating a paid or
  -- cancelled invoice into a fresh draft is the intended "repeat" flow.
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
  -- Copied from source:  customer_id, gst_enabled, is_interstate,
  --   place_of_supply, discount, notes, terms,
  --   subtotal, cgst, sgst, igst, tax_total, round_off, total.
  -- Reset to draft defaults: number → NULL, status → 'draft',
  --   amount_paid → 0, paid_at/sent_at/viewed_at/public_token/pdf_url → NULL,
  --   issue_date → CURRENT_DATE, due_date → NULL.
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
  -- All computed amount columns copied verbatim — they are internally
  -- consistent with the header totals inserted above.
  -- Note: invoice_line_items has no created_at/updated_at columns.
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

  RETURN jsonb_build_object(
    'invoice_id', v_new_id,
    'status',     'draft'
  );
END;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.duplicate_invoice(uuid, uuid)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.duplicate_invoice(uuid, uuid)
  FROM PUBLIC, anon;
