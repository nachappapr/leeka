-- list_invoices_page: SECURITY INVOKER → SECURITY DEFINER
--
-- Context: the invoices list read path now runs inside a Next.js `use cache`
-- function, which has no request context and therefore no Supabase auth
-- session. It calls this RPC via the service-role (admin) client, so
-- auth.uid() is NULL and the previous SECURITY INVOKER + membership guard
-- always returned zero rows.
--
-- New trust model (mirrors dashboard_summary / AP-33 precedent):
--   * The proxy (middleware) verifies the session, resolves the caller's
--     business_id under RLS, and forwards it as a server-set x-business-id
--     header that a client cannot spoof.
--   * Only the server (service-role) calls this RPC, passing that verified
--     p_business_id. EXECUTE is therefore restricted to service_role.
--
-- Changes vs AP-42 version:
--   * SECURITY DEFINER instead of SECURITY INVOKER
--   * auth.uid() membership subquery removed — tenant isolation enforced
--     by the verified p_business_id at the proxy boundary
--   * plain WHERE i.business_id = p_business_id replaces the IN subquery

create or replace function public.list_invoices_page(
  p_business_id       uuid,
  p_status            public.invoice_status default null,
  p_cursor_issue_date date                  default null,
  p_cursor_id         uuid                  default null,
  p_limit             int                   default 25
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
security definer
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
    i.business_id = p_business_id
    -- Exclude cancelled: no UI chip, app-wide convention (ap42_exclude_cancelled)
    and i.status <> 'cancelled'
    and (p_status is null or i.status = p_status)
    and (
      p_cursor_issue_date is null
      or p_cursor_id is null
      or (i.issue_date, i.id) < (p_cursor_issue_date, p_cursor_id)
    )
  order by i.issue_date desc, i.id desc
  limit least(greatest(p_limit, 1), 100)
$$;

revoke execute on function public.list_invoices_page(uuid, public.invoice_status, date, uuid, int) from public, anon, authenticated;
grant  execute on function public.list_invoices_page(uuid, public.invoice_status, date, uuid, int) to service_role;
