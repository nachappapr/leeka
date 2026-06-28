-- Add public_token to list_invoices_page return shape
--
-- Adds public_token text to RETURNS TABLE and selects i.public_token so
-- the invoice list can build the hosted pay URL (${appBase}/pay/${public_token})
-- synchronously on click without a second fetch.
--
-- Because RETURNS TABLE gains a new column, CREATE OR REPLACE would fail —
-- DROP + CREATE is required.  The parameter signature is unchanged; grants
-- are re-issued after the DROP because they reset with the function.

-- ── 1. Drop current function (signature: uuid, invoice_status, date, timestamptz, uuid, int) ──
drop function if exists public.list_invoices_page(uuid, public.invoice_status, date, timestamptz, uuid, int);

-- ── 2. Recreate with public_token appended to the return table ───────────────────────────────
--
-- Security model (unchanged):
--   SECURITY DEFINER — called via service-role admin client inside `use cache`
--   where auth.uid() is NULL. Tenant isolation is enforced by the verified
--   p_business_id forwarded from the proxy boundary. EXECUTE is restricted to
--   service_role only.
create function public.list_invoices_page(
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
  status        public.invoice_status,
  public_token  text
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
    i.status,
    i.public_token
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
