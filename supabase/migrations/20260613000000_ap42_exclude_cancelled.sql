-- AP-42 amendment: exclude cancelled invoices from list_invoices_page + invoice_status_counts
--
-- The invoices list UI has no "cancelled" status chip (StatusPillStatus lacks the variant)
-- and the app convention excludes cancelled everywhere:
--   src/app/api/invoices/export/csv/route.ts:113   .neq("status","cancelled")
--   src/components/customers/customer-detail-container.tsx:76
--   src/lib/data/dashboard.ts:111
--
-- Fix: add `i.status <> 'cancelled'` unconditionally to both RPCs.
-- p_status will never legitimately be 'cancelled' (UI has no such chip),
-- so the unconditional predicate is simplest and correct.
--
-- list_customers_page and all indexes are left untouched.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. list_invoices_page — add status <> 'cancelled' exclusion
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.list_invoices_page(
  p_business_id     uuid,
  p_status          public.invoice_status default null,
  p_cursor_issue_date date              default null,
  p_cursor_id       uuid               default null,
  p_limit           int                default 25
)
returns table (
  id            uuid,
  number        text,
  customer_name text,
  customer_city text,
  issue_date    date,
  total         int,
  status        public.invoice_status
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    i.id,
    i.number,
    c.name  as customer_name,
    c.city  as customer_city,
    i.issue_date,
    i.total,
    i.status
  from public.invoices i
  left join public.customers c on c.id = i.customer_id
  where
    -- Membership guard: caller must belong to this business
    i.business_id = p_business_id
    and i.business_id in (
      select bm.business_id
      from public.business_members bm
      where bm.user_id = (select auth.uid())
        and bm.business_id = p_business_id
    )
    -- Exclude cancelled: no UI chip, app-wide convention
    and i.status <> 'cancelled'
    -- Optional status filter
    and (p_status is null or i.status = p_status)
    -- Keyset cursor: when both cursor args are non-null, page forward
    and (
      p_cursor_issue_date is null
      or p_cursor_id is null
      or (i.issue_date, i.id) < (p_cursor_issue_date, p_cursor_id)
    )
  order by i.issue_date desc, i.id desc
  limit least(greatest(p_limit, 1), 100)
$$;

revoke execute on function public.list_invoices_page(uuid, public.invoice_status, date, uuid, int) from public, anon;
grant  execute on function public.list_invoices_page(uuid, public.invoice_status, date, uuid, int) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. invoice_status_counts — exclude cancelled rows from the breakdown
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.invoice_status_counts()
returns table (
  status public.invoice_status,
  count  bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select i.status, count(*) as count
  from public.invoices i
  where i.business_id in (
    select bm.business_id
    from public.business_members bm
    where bm.user_id = (select auth.uid())
  )
    and i.status <> 'cancelled'
  group by i.status
$$;

revoke execute on function public.invoice_status_counts() from public, anon;
grant  execute on function public.invoice_status_counts() to authenticated;
