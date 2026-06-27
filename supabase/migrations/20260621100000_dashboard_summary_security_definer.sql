-- dashboard_summary: SECURITY INVOKER → SECURITY DEFINER
--
-- Context: the dashboard read path now runs inside a Next.js `use cache`
-- function, which has no request context and therefore no Supabase auth
-- session. It calls this RPC via the service-role (admin) client, so
-- auth.uid() is NULL and the previous SECURITY INVOKER + membership guard
-- always raised.
--
-- New trust model:
--   * The proxy (middleware) verifies the session, resolves the caller's
--     business_id under RLS, and forwards it as a server-set x-business-id
--     header that a client cannot spoof.
--   * Only the server (service-role) calls this RPC, passing that verified
--     p_business_id. EXECUTE is therefore restricted to service_role.
--
-- The function body is byte-for-byte identical to the AP-33 version EXCEPT:
--   * SECURITY DEFINER instead of SECURITY INVOKER
--   * the auth.uid() membership guard is removed (no session under service role;
--     tenant isolation is enforced by the verified p_business_id at the boundary)

CREATE OR REPLACE FUNCTION public.dashboard_summary(
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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
  v_ist_month_start := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date;

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

  SELECT COALESCE(SUM(amount), 0)
    INTO v_paid_this_month
    FROM payments
   WHERE business_id = p_business_id
     AND (paid_at AT TIME ZONE 'Asia/Kolkata')::date >= v_ist_month_start
     AND (paid_at AT TIME ZONE 'Asia/Kolkata')::date < (v_ist_month_start + interval '1 month')::date;

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

-- Lock execution down to the service role only — this is no longer safe to call
-- directly from an authenticated session (it trusts p_business_id with no guard).
REVOKE EXECUTE ON FUNCTION public.dashboard_summary(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dashboard_summary(uuid) TO service_role;
