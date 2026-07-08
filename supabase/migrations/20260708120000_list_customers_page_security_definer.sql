-- list_customers_page: SECURITY INVOKER → SECURITY DEFINER
--
-- Context: since #28 (commit 118c7ba), the customers list read path runs
-- inside a Next.js `use cache` function (listCustomersPage in
-- src/lib/data/customer.ts), which has no request context and therefore no
-- Supabase auth session. It calls this RPC via the service-role (admin)
-- client, so auth.uid() is NULL and the previous SECURITY INVOKER +
-- business_members membership guard always returned zero rows — the
-- customers list rendered empty ("No customers yet") for every business.
--
-- New trust model (mirrors list_invoices_page / dashboard_summary,
-- 20260621110000_list_invoices_page_security_definer):
--   * Authorization happens server-side in resolveBusinessId (cookie-scoped
--     client, src/lib/data/invoice.ts) BEFORE the cache boundary is crossed.
--   * Only the server (service-role) calls this RPC, passing that verified
--     p_business_id. EXECUTE is therefore restricted to service_role.
--
-- Changes vs 20260707100000_customer_soft_delete version:
--   * SECURITY DEFINER instead of SECURITY INVOKER
--   * auth.uid() / business_members membership subquery removed — tenant
--     isolation enforced by the verified p_business_id at the server
--     boundary, not inside the RPC
--   * Body is otherwise byte-for-byte identical: deleted_at filter, keyset
--     cursor clause, ordering, limit clamp all unchanged

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
security definer
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
    c.business_id = p_business_id
    -- Soft-delete filter
    and c.deleted_at is null
    -- Keyset cursor: when both cursor args are non-null, page forward
    and (
      p_cursor_name is null
      or p_cursor_id is null
      or (c.name, c.id) > (p_cursor_name, p_cursor_id)
    )
  order by c.name asc, c.id asc
  limit least(greatest(p_limit, 1), 100)
$$;

revoke execute on function public.list_customers_page(uuid, text, uuid, int) from public, anon, authenticated;
grant  execute on function public.list_customers_page(uuid, text, uuid, int) to service_role;
