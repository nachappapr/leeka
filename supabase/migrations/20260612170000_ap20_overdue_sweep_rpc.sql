-- AP-20: sweep_overdue_invoices RPC
--
-- Purpose: Daily cron sweep — flip every unpaid sent/viewed invoice whose
--   due_date has passed (in IST) to 'overdue', emit one invoice_event, and
--   create one in-app notification for the business owner.
--
-- IST boundary: due_date < (now() AT TIME ZONE 'Asia/Kolkata')::date
--   means "IST calendar date of due_date is strictly before IST today".
--   A due_date of IST-today is NOT yet overdue; IST-yesterday IS.
--   This satisfies the PRD requirement "overdue set the day after due date".
--
-- Cron schedule: 30 19 * * * UTC = 01:00 IST — shortly after IST midnight,
--   so the sweep runs on the correct IST calendar day boundary.
--
-- Security design: SECURITY INVOKER.
--   This RPC is GRANT-ed only to service_role. The service-role client bypasses
--   RLS entirely regardless of INVOKER vs DEFINER, so INVOKER is the safer
--   default — it does not inadvertently elevate a future misconfigured caller.
--   REVOKE from PUBLIC, anon, authenticated so only the server-side cron path
--   (via the admin client) can execute it.
--
-- No membership guard: this is a background sweep with no auth.uid(). Access
--   control is enforced solely by the GRANT/REVOKE block below (service_role
--   only). This is deliberate and documented — do not add an auth.uid() guard.
--
-- Idempotency: the UPDATE filters status IN ('sent','viewed'), so
--   already-overdue rows are never re-touched. A second run on the same day
--   returns swept_count = 0 and inserts no duplicate events/notifications.
--
-- Returns: jsonb { swept_count: int, invoice_ids: uuid[] }

CREATE OR REPLACE FUNCTION public.sweep_overdue_invoices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_ist_today   date;
  v_swept_ids   uuid[];
  v_swept_count int;
BEGIN
  -- Compute IST calendar date once; reuse in all predicates.
  v_ist_today := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  -- ── Step 1: flip status + collect IDs ────────────────────────────────────
  -- Writable CTE is the idiomatic plpgsql way to capture all rows returned by
  -- a multi-row UPDATE. The CTE is fully materialised by PostgreSQL, so the
  -- UPDATE executes exactly once regardless of how the outer SELECT uses it.
  WITH upd AS (
    UPDATE invoices
       SET status     = 'overdue',
           updated_at = now()
     WHERE status   IN ('sent', 'viewed')
       AND due_date IS NOT NULL
       AND due_date < v_ist_today
    RETURNING id
  )
  SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::uuid[])
    INTO v_swept_ids
    FROM upd;

  v_swept_count := COALESCE(array_length(v_swept_ids, 1), 0);

  -- Short-circuit: nothing to do — return early, insert nothing.
  IF v_swept_count = 0 THEN
    RETURN jsonb_build_object(
      'swept_count', 0,
      'invoice_ids', '[]'::jsonb
    );
  END IF;

  -- ── Step 2: emit one invoice_event per flipped invoice ────────────────────
  -- Re-join invoices to get business_id and due_date.
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
  -- Body carries invoice number + total (integer paise ÷ 100 = rupees).
  -- No customer PII — number and total are owned by the business owner.
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
    'swept_count', v_swept_count,
    'invoice_ids', to_jsonb(v_swept_ids)
  );
END;
$$;

-- ── Partial index: accelerates the sweep's candidate-selection scan ────────
-- The existing composite index (business_id, status, issue_date desc) does not
-- cover a global status + due_date predicate. Without this index, every daily
-- sweep performs a full sequential scan of invoices.
-- This partial index covers exactly the rows that are candidates for the sweep
-- and no others, keeping it small and cheap to maintain.
CREATE INDEX IF NOT EXISTS invoices_overdue_sweep_idx
  ON public.invoices (due_date)
  WHERE status IN ('sent', 'viewed');

-- ── Grants ─────────────────────────────────────────────────────────────────
-- service_role only — this is a background cron RPC with no auth context.
GRANT EXECUTE ON FUNCTION public.sweep_overdue_invoices()
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.sweep_overdue_invoices()
  FROM PUBLIC, anon, authenticated;
