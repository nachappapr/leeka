-- Fix invoice list ordering: thread created_at into list_invoices_page
--
-- Problem: list_invoices_page ordered by (issue_date DESC, id DESC).
-- issue_date is date (day granularity) and id is random UUIDv4, so invoices
-- created on the same day returned in random order — the newest did not land
-- on top.
--
-- Fix: ORDER BY issue_date DESC, created_at DESC, id DESC.
-- created_at is timestamptz (microsecond precision); id remains the final
-- tiebreaker for the rare sub-microsecond collision.
--
-- Cursor: p_cursor_created_at (timestamptz) added as the second cursor field.
-- Keyset compare: (i.issue_date, i.created_at, i.id) < (p_cursor_issue_date,
--   p_cursor_created_at, p_cursor_id).
--
-- Return shape: created_at added as a timestamptz column so the caller can
-- populate the cursor without a separate fetch.
--
-- Because RETURNS TABLE gains a new column, CREATE OR REPLACE would fail —
-- DROP + CREATE is required.
--
-- Indexes: drop + recreate invoices_list_unfiltered_idx and
-- invoices_list_status_idx with created_at inserted between issue_date and id
-- so Postgres can satisfy the full ORDER BY from the index without a sort step
-- even when many invoices share the same issue_date.

-- ── 1. Drop old function (old signature: uuid, invoice_status, date, uuid, int) ──
drop function if exists public.list_invoices_page(uuid, public.invoice_status, date, uuid, int);

-- ── 2. Rebuild keyset covering indexes with created_at threaded in ────────────────
drop index if exists public.invoices_list_unfiltered_idx;
drop index if exists public.invoices_list_status_idx;

create index invoices_list_unfiltered_idx
  on public.invoices (business_id, issue_date desc, created_at desc, id desc);

create index invoices_list_status_idx
  on public.invoices (business_id, status, issue_date desc, created_at desc, id desc);

-- ── 3. Recreate list_invoices_page with created_at in cursor + ORDER BY ───────────
--
-- Security model (unchanged from AP-45 / 20260621110000 version):
--   SECURITY DEFINER — called via service-role admin client inside `use cache`
--   where auth.uid() is NULL. Tenant isolation is enforced by the verified
--   p_business_id forwarded from the proxy boundary. EXECUTE is restricted to
--   service_role only.
create or replace function public.list_invoices_page(
  p_business_id           uuid,
  p_status                public.invoice_status default null,
  p_cursor_issue_date     date                  default null,
  p_cursor_created_at     timestamptz           default null,
  p_cursor_id             uuid                  default null,
  p_limit                 int                   default 25
)
returns table (
  id            uuid,
  number        text,
  customer_name text,
  customer_city text,
  issue_date    date,
  created_at    timestamptz,
  total         int,
  status        public.invoice_status
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    i.id,
    i.number,
    c.name       as customer_name,
    c.city       as customer_city,
    i.issue_date,
    i.created_at,
    i.total,
    i.status
  from public.invoices i
  left join public.customers c on c.id = i.customer_id
  where
    i.business_id = p_business_id
    -- Exclude cancelled: no UI chip, app-wide convention (ap42_exclude_cancelled)
    and i.status <> 'cancelled'
    and (p_status is null or i.status = p_status)
    and (
      p_cursor_issue_date  is null
      or p_cursor_created_at is null
      or p_cursor_id         is null
      or (i.issue_date, i.created_at, i.id) < (p_cursor_issue_date, p_cursor_created_at, p_cursor_id)
    )
  order by i.issue_date desc, i.created_at desc, i.id desc
  limit least(greatest(p_limit, 1), 100)
$$;

revoke execute on function public.list_invoices_page(uuid, public.invoice_status, date, timestamptz, uuid, int) from public, anon, authenticated;
grant  execute on function public.list_invoices_page(uuid, public.invoice_status, date, timestamptz, uuid, int) to service_role;
