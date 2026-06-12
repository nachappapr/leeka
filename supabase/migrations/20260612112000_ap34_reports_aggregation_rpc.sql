-- AP-34: Reports DB-side aggregation
--
-- Adds get_reports_metrics(p_business_id, p_from, p_to) → jsonb.
-- Returns a months array (zero-filled via generate_series for continuous
-- chart data) and a summary object with revenue, received, invoice_count,
-- avg_invoice_value, and avg_days_to_pay.
--
-- Also adds the payments_business_paid_at_idx composite index for the
-- payments leg of the aggregate (single-column payments_business_id_idx
-- already exists from AP-8 but does not support ordered paid_at range scans).

-- ── Index: payments (business_id, paid_at desc) ───────────────────────────────
CREATE INDEX IF NOT EXISTS payments_business_paid_at_idx
  ON public.payments (business_id, paid_at DESC);

-- ── RPC ───────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_reports_metrics(
  p_business_id uuid,
  p_from        date,
  p_to          date
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
declare
  v_months         jsonb;
  v_summary        jsonb;
  v_revenue        bigint;
  v_received       bigint;
  v_invoice_count  bigint;
  v_avg_value      bigint;
  v_avg_days       numeric;
begin
  -- ── Membership guard ─────────────────────────────────────────────────────────
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  -- ── Input validation ─────────────────────────────────────────────────────────
  if p_from > p_to then
    raise exception 'p_from must be <= p_to';
  end if;

  -- ── Per-month revenue aggregate ───────────────────────────────────────────────
  -- Generates every calendar month in [p_from, p_to] via generate_series so the
  -- result is continuous (zero-filled months appear even when there are no rows).
  -- Revenue = invoices.total for status NOT IN ('draft','cancelled'), bucketed by
  -- date_trunc('month', issue_date). Uses the (business_id, status, issue_date DESC)
  -- index on the invoices table (see AP-8 migration).
  WITH months AS (
    SELECT date_trunc('month', gs)::date AS month_start
    FROM generate_series(
      date_trunc('month', p_from::timestamptz),
      date_trunc('month', p_to::timestamptz),
      '1 month'::interval
    ) AS gs
  ),
  inv_monthly AS (
    SELECT
      date_trunc('month', issue_date)::date AS month_start,
      coalesce(sum(total), 0)::bigint        AS rev
    FROM invoices
    WHERE business_id = p_business_id
      AND status NOT IN ('draft', 'cancelled')
      AND issue_date BETWEEN p_from AND p_to
    GROUP BY 1
  ),
  pay_monthly AS (
    SELECT
      date_trunc('month', paid_at)::date AS month_start,
      coalesce(sum(amount), 0)::bigint   AS rec
    FROM payments
    WHERE business_id = p_business_id
      AND paid_at::date BETWEEN p_from AND p_to
    GROUP BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month',    to_char(m.month_start, 'YYYY-MM'),
      'revenue',  coalesce(i.rev, 0),
      'received', coalesce(p.rec, 0)
    )
    ORDER BY m.month_start
  )
  INTO v_months
  FROM months m
  LEFT JOIN inv_monthly i USING (month_start)
  LEFT JOIN pay_monthly p USING (month_start);

  -- ── Summary aggregates ────────────────────────────────────────────────────────
  SELECT
    coalesce(sum(total), 0)::bigint,
    count(*)::bigint,
    coalesce(round(avg(total)), 0)::bigint
  INTO v_revenue, v_invoice_count, v_avg_value
  FROM invoices
  WHERE business_id = p_business_id
    AND status NOT IN ('draft', 'cancelled')
    AND issue_date BETWEEN p_from AND p_to;

  SELECT coalesce(sum(amount), 0)::bigint
  INTO v_received
  FROM payments
  WHERE business_id = p_business_id
    AND paid_at::date BETWEEN p_from AND p_to;

  -- avg_days_to_pay: average elapsed days from issue_date to paid_at for invoices
  -- that reached 'paid' status in the range. Uses epoch arithmetic (seconds ÷ 86400)
  -- because paid_at is timestamptz while issue_date is date — casting issue_date to
  -- timestamptz aligns the types for the subtraction.
  SELECT round(
    avg(
      extract(epoch from (i.paid_at - i.issue_date::timestamptz)) / 86400.0
    )::numeric,
    1
  )
  INTO v_avg_days
  FROM invoices i
  WHERE i.business_id = p_business_id
    AND i.status = 'paid'
    AND i.paid_at IS NOT NULL
    AND i.paid_at::date BETWEEN p_from AND p_to;

  v_summary := jsonb_build_object(
    'revenue',          v_revenue,
    'received',         v_received,
    'invoice_count',    v_invoice_count,
    'avg_invoice_value', v_avg_value,
    'avg_days_to_pay',  v_avg_days   -- numeric (1 decimal) or null when no paid invoices
  );

  RETURN jsonb_build_object(
    'months',  coalesce(v_months, '[]'::jsonb),
    'summary', v_summary
  );
end;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.get_reports_metrics(uuid, date, date)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_reports_metrics(uuid, date, date)
  FROM PUBLIC, anon;
