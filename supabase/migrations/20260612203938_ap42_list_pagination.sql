-- AP-42: Keyset pagination indexes + list RPCs for invoices and customers
--
-- Adds:
--   1. invoices(business_id, issue_date DESC, id DESC) — unfiltered list path
--   2. invoices(business_id, status, issue_date DESC, id DESC) — status-filtered path
--      Drops invoices_business_id_status_issue_date_idx (3-col prefix fully covered)
--   3. customers(business_id, name, id) — keyset list path
--      Drops customers_business_name_idx (2-col prefix fully covered)
--   4. list_invoices_page(...) — keyset-paginated invoice list RPC
--   5. invoice_status_counts() — per-tenant status breakdown
--   6. list_customers_page(...) — keyset-paginated customer list RPC
--
-- Security model:
--   All three RPCs are SECURITY INVOKER — RLS on invoices/customers enforces
--   tenant scoping. We additionally check business_members membership so the
--   caller cannot pass an arbitrary p_business_id they don't own.
--
-- Conventions (from AP-41 reference):
--   - STABLE + set search_path = '' (fully-qualified names)
--   - GRANT EXECUTE to authenticated; REVOKE from public, anon
--   - Money is integer paise throughout (invoices.total INT4)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Unfiltered list path: business_id, issue_date DESC, id DESC
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists invoices_list_unfiltered_idx
  on public.invoices (business_id, issue_date desc, id desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Status-filtered path: business_id, status, issue_date DESC, id DESC
--    Drop the old 3-column prefix index (now a strict subset, causes advisor noise)
-- ─────────────────────────────────────────────────────────────────────────────
drop index if exists public.invoices_business_id_status_issue_date_idx;

create index if not exists invoices_list_status_idx
  on public.invoices (business_id, status, issue_date desc, id desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Customer keyset path: business_id, name, id
--    Drop the old 2-column prefix index (now a strict subset)
-- ─────────────────────────────────────────────────────────────────────────────
drop index if exists public.customers_business_name_idx;

create index if not exists customers_list_keyset_idx
  on public.customers (business_id, name, id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. list_invoices_page
--    Keyset-paginated invoice list for the caller's business.
--    Cursor is (issue_date, id); ordering is (issue_date DESC, id DESC).
--    Joins customers for customer_name + customer_city.
--    p_status filters by status when non-null.
--    p_limit is capped at 100, floored at 1.
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
-- 5. invoice_status_counts
--    Returns (status, count) for every status present in the caller's business.
--    Business is resolved via business_members for the calling user.
--    No p_business_id argument — single-business-per-user assumption holds for v1
--    (matches pattern used in dashboard_summary / get_reports_metrics).
--    SECURITY INVOKER: RLS on invoices restricts rows to caller's tenants.
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
  group by i.status
$$;

revoke execute on function public.invoice_status_counts() from public, anon;
grant  execute on function public.invoice_status_counts() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. list_customers_page
--    Keyset-paginated customer list for the caller's business.
--    Cursor is (name, id); ordering is (name ASC, id ASC).
--    p_limit is capped at 100, floored at 1.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.list_customers_page(
  p_business_id   uuid,
  p_cursor_name   text default null,
  p_cursor_id     uuid default null,
  p_limit         int  default 25
)
returns table (
  id              uuid,
  name            text,
  phone           text,
  email           text,
  gstin           text,
  billing_address text,
  city            text,
  created_at      timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    c.name,
    c.phone,
    c.email,
    c.gstin,
    c.billing_address,
    c.city,
    c.created_at
  from public.customers c
  where
    -- Membership guard
    c.business_id = p_business_id
    and c.business_id in (
      select bm.business_id
      from public.business_members bm
      where bm.user_id = (select auth.uid())
        and bm.business_id = p_business_id
    )
    -- Keyset cursor: when both cursor args are non-null, page forward
    and (
      p_cursor_name is null
      or p_cursor_id is null
      or (c.name, c.id) > (p_cursor_name, p_cursor_id)
    )
  order by c.name asc, c.id asc
  limit least(greatest(p_limit, 1), 100)
$$;

revoke execute on function public.list_customers_page(uuid, text, uuid, int) from public, anon;
grant  execute on function public.list_customers_page(uuid, text, uuid, int) to authenticated;
