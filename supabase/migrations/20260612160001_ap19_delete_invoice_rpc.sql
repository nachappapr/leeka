-- AP-19 Unit 2: delete_invoice RPC
--
-- Hard-deletes a DRAFT invoice and its line-item children:
--   1. Membership guard (mirrors cancel_invoice).
--   2. FOR UPDATE row-lock: ownership + existence guard.
--   3. Status guard: only 'draft' invoices may be deleted.  Issued invoices
--      are a permanent legal/audit record — they must be cancelled, not deleted.
--   4. Explicit child delete: invoice_line_items WHERE invoice_id = p_invoice_id.
--      Although the FK has ON DELETE CASCADE, we delete children explicitly so
--      the operation is safe even if the cascade rule were ever changed.
--   5. DELETE the invoice row.
--   6. Returns jsonb { invoice_id, deleted: true }.

CREATE OR REPLACE FUNCTION public.delete_invoice(
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

  -- ── Status guard ──────────────────────────────────────────────────────────────
  IF v_invoice.status <> 'draft' THEN
    RAISE EXCEPTION 'cannot delete a non-draft invoice (cancel it instead)';
  END IF;

  -- ── Delete children first, then the invoice row ───────────────────────────────
  -- Explicit child delete is safe even if the CASCADE rule changes in future.
  DELETE FROM invoice_line_items
   WHERE invoice_id = p_invoice_id;

  DELETE FROM invoices
   WHERE id          = p_invoice_id
     AND business_id = p_business_id;

  RETURN jsonb_build_object(
    'invoice_id', p_invoice_id,
    'deleted',    true
  );
END;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.delete_invoice(uuid, uuid)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.delete_invoice(uuid, uuid)
  FROM PUBLIC, anon;
