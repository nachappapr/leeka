-- AP-20 fix (issue #14): sweep_overdue_invoices now returns the distinct
-- business_ids of swept invoices so the cron route can scope cache
-- invalidation to the affected businesses only, instead of waiting for
-- cacheLife expiry.
--
-- Change from original migration (20260612085951):
--   • Writable CTE RETURNING now includes business_id.
--   • ARRAY_AGG(DISTINCT business_id) captured into v_business_ids.
--   • Both return paths (early-exit and success) include 'business_ids'.
--
-- All other behaviour is preserved verbatim:
--   status flip, invoice_events insert, notifications insert, idempotency,
--   IST boundary, SECURITY INVOKER, GRANT/REVOKE.
-- The partial index (invoices_overdue_sweep_idx) is unchanged — not recreated.

CREATE OR REPLACE FUNCTION public.sweep_overdue_invoices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_ist_today    date;
  v_swept_ids    uuid[];
  v_business_ids uuid[];
  v_swept_count  int;
BEGIN
  -- Compute IST calendar date once; reuse in all predicates.
  v_ist_today := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  -- ── Step 1: flip status + collect invoice IDs and business IDs ───────────
  -- RETURNING now includes business_id so distinct businesses are captured
  -- without a second table scan.
  WITH upd AS (
    UPDATE invoices
       SET status     = 'overdue',
           updated_at = now()
     WHERE status   IN ('sent', 'viewed')
       AND due_date IS NOT NULL
       AND due_date < v_ist_today
    RETURNING id, business_id
  )
  SELECT
    COALESCE(ARRAY_AGG(id),                   ARRAY[]::uuid[]),
    COALESCE(ARRAY_AGG(DISTINCT business_id), ARRAY[]::uuid[])
    INTO v_swept_ids, v_business_ids
    FROM upd;

  v_swept_count := COALESCE(array_length(v_swept_ids, 1), 0);

  -- Short-circuit: nothing to do — return early, insert nothing.
  IF v_swept_count = 0 THEN
    RETURN jsonb_build_object(
      'swept_count',  0,
      'invoice_ids',  '[]'::jsonb,
      'business_ids', '[]'::jsonb
    );
  END IF;

  -- ── Step 2: emit one invoice_event per flipped invoice ────────────────────
  -- Re-join invoices to get business_id and due_date for the event payload.
  INSERT INTO invoice_events (business_id, invoice_id, type, meta)
  SELECT
    i.business_id,
    i.id,
    'overdue',
    jsonb_build_object('due_date', i.due_date)
  FROM invoices i
  WHERE i.id = ANY(v_swept_ids);

  -- ── Step 3: emit one notification per flipped invoice ────────────────────
  -- Addressed to businesses.owner_id (the sole stakeholder per PRD).
  INSERT INTO notifications (business_id, user_id, type, title, body, link)
  SELECT
    i.business_id,
    b.owner_id,
    'invoice_overdue',
    'Invoice overdue: ' || COALESCE(i.number, 'N/A'),
    'Invoice ' || COALESCE(i.number, 'N/A')
      || ' (₹' || FLOOR(i.total / 100.0)::text || ') was due on '
      || to_char(i.due_date, 'DD Mon YYYY')
      || ' and is now overdue.',
    '/invoices/' || i.id::text
  FROM invoices i
  JOIN businesses b ON b.id = i.business_id
  WHERE i.id = ANY(v_swept_ids);

  RETURN jsonb_build_object(
    'swept_count',  v_swept_count,
    'invoice_ids',  to_jsonb(v_swept_ids),
    'business_ids', to_jsonb(v_business_ids)
  );
END;
$$;

-- Re-assert grants (idempotent for CREATE OR REPLACE).
-- service_role only — this is a background cron RPC with no auth context.
GRANT EXECUTE ON FUNCTION public.sweep_overdue_invoices()
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.sweep_overdue_invoices()
  FROM PUBLIC, anon, authenticated;
