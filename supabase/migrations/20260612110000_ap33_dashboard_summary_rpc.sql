-- AP-33 Unit 1: dashboard_summary RPC
--
-- Returns a single jsonb with all dashboard summary aggregates for a business.
-- Designed for a single round-trip from the dashboard page.
--
-- Tenant guard: caller must be a member of p_business_id via business_members.
--   Same SECURITY INVOKER + membership guard pattern as next_invoice_number and
--   record_payment — the RLS on invoices/payments enforces table-level access;
--   the membership check here provides an explicit, early-exit guard.
--
-- IST month boundary (AP-20 precedent):
--   paid_this_month aggregates payments where
--   (paid_at AT TIME ZONE 'Asia/Kolkata')::date >= IST month start
--   where IST month start = date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date
--   This mirrors the AP-20 pattern: convert to IST calendar date before comparing.
--
-- Single round-trip design:
--   All six aggregates (outstanding_amount, outstanding_count, overdue_amount,
--   overdue_count, paid_this_month, status_counts) are computed in one SELECT
--   using lateral scalar subqueries. The planner can push the business_id
--   predicate into each subquery and use the existing composite index
--   invoices_business_id_status_issue_date_idx for the invoices scans.
--
-- Integer arithmetic only: all amounts in paise (integer). No float/numeric.
-- Zero-filling: COALESCE on every aggregate; status_counts always has all 8 keys.
--
-- Returns jsonb — shape:
-- {
--   "outstanding_amount": bigint,
--   "outstanding_count":  int,
--   "overdue_amount":     bigint,
--   "overdue_count":      int,
--   "paid_this_month":    bigint,
--   "status_counts": {
--     "draft": int, "sent": int, "viewed": int, "partial": int,
--     "pending": int, "paid": int, "overdue": int, "cancelled": int
--   }
-- }

CREATE OR REPLACE FUNCTION public.dashboard_summary(
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_outstanding_amount  bigint;
  v_outstanding_count   int;
  v_overdue_amount      bigint;
  v_overdue_count       int;
  v_paid_this_month     bigint;
  v_status_counts       jsonb;
  v_ist_month_start     date;
BEGIN
  -- ── Membership guard ──────────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = p_business_id
      AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── IST month start (AP-20 precedent) ────────────────────────────────────────
  -- Convert current timestamp to Asia/Kolkata timezone, truncate to month start,
  -- then cast to date. Used as the inclusive lower bound for paid_this_month.
  v_ist_month_start := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date;

  -- ── Single aggregation pass over invoices ─────────────────────────────────────
  -- outstanding: status IN ('sent','viewed','partial','pending','overdue')
  -- overdue:     status = 'overdue'
  -- Both use (total - amount_paid) as the outstanding paise for each invoice.
  SELECT
    COALESCE(SUM(CASE WHEN status IN ('sent','viewed','partial','pending','overdue')
                      THEN GREATEST(total - amount_paid, 0)
                      ELSE 0
                 END), 0),
    COALESCE(SUM(CASE WHEN status IN ('sent','viewed','partial','pending','overdue')
                      THEN 1
                      ELSE 0
                 END), 0),
    COALESCE(SUM(CASE WHEN status = 'overdue'
                      THEN GREATEST(total - amount_paid, 0)
                      ELSE 0
                 END), 0),
    COALESCE(SUM(CASE WHEN status = 'overdue'
                      THEN 1
                      ELSE 0
                 END), 0)
  INTO
    v_outstanding_amount,
    v_outstanding_count,
    v_overdue_amount,
    v_overdue_count
  FROM invoices
  WHERE business_id = p_business_id;

  -- ── paid_this_month: payments within current IST calendar month ───────────────
  -- Compare the IST calendar date of paid_at against the IST month start date.
  -- Casting (paid_at AT TIME ZONE 'Asia/Kolkata')::date mirrors AP-20's pattern
  -- and avoids timezone-boundary errors (a UTC payment at 23:30 Dec 31 is a
  -- Jan 1 IST payment and must count in January, not December).
  SELECT COALESCE(SUM(amount), 0)
    INTO v_paid_this_month
    FROM payments
   WHERE business_id = p_business_id
     AND (paid_at AT TIME ZONE 'Asia/Kolkata')::date >= v_ist_month_start
     AND (paid_at AT TIME ZONE 'Asia/Kolkata')::date < (v_ist_month_start + interval '1 month')::date;

  -- ── status_counts: all 8 enum keys, zero-filled ───────────────────────────────
  -- Build the full 8-key object by seeding every key to 0 then overlaying the
  -- actual counts. jsonb || operator merges, right side wins on conflict.
  -- This guarantees the shape even for a business with no invoices.
  -- IMPORTANT: if a new value is added to the invoice_status enum, this
  -- jsonb_build_object literal must be updated in the same migration.
  SELECT
    jsonb_build_object(
      'draft',     0,
      'sent',      0,
      'viewed',    0,
      'partial',   0,
      'pending',   0,
      'paid',      0,
      'overdue',   0,
      'cancelled', 0
    ) ||
    COALESCE(
      (
        SELECT jsonb_object_agg(status::text, cnt)
        FROM (
          SELECT status, COUNT(*)::int AS cnt
            FROM invoices
           WHERE business_id = p_business_id
           GROUP BY status
        ) sub
      ),
      '{}'::jsonb
    )
  INTO v_status_counts;

  RETURN jsonb_build_object(
    'outstanding_amount', v_outstanding_amount,
    'outstanding_count',  v_outstanding_count,
    'overdue_amount',     v_overdue_amount,
    'overdue_count',      v_overdue_count,
    'paid_this_month',    v_paid_this_month,
    'status_counts',      v_status_counts
  );
END;
$$;

-- ── Grants: authenticated only ────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.dashboard_summary(uuid)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.dashboard_summary(uuid)
  FROM PUBLIC, anon;
