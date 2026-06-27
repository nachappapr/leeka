-- invoice_status_counts: drop no-arg INVOKER → create p_business_id DEFINER
--
-- Context: the invoices list read path now runs inside a Next.js `use cache`
-- function, which has no request context and therefore no Supabase auth
-- session. It calls this RPC via the service-role (admin) client, passing
-- p_business_id explicitly. The old no-arg function (AP-42) relied on
-- auth.uid() which is NULL under service_role — it always returned nothing.
--
-- New trust model (mirrors dashboard_summary / AP-33 precedent):
--   * The proxy (middleware) verifies the session and resolves business_id.
--   * Only the server (service-role) calls this RPC. EXECUTE is restricted
--     to service_role; authenticated and anon cannot call it.
--
-- Changes vs AP-42 version:
--   * DROP the no-arg function (src/lib/data/invoice.ts already switched
--     to the p_business_id signature via the frontend caching pass)
--   * New signature: invoice_status_counts(p_business_id uuid)
--   * SECURITY DEFINER instead of SECURITY INVOKER
--   * Body uses plain WHERE business_id = p_business_id — no auth.uid()

drop function if exists public.invoice_status_counts();

create or replace function public.invoice_status_counts(
  p_business_id uuid
)
returns table (
  status public.invoice_status,
  count  bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.status, count(*) as count
  from public.invoices i
  where i.business_id = p_business_id
    -- Exclude cancelled: no UI chip, app-wide convention (ap42_exclude_cancelled)
    and i.status <> 'cancelled'
  group by i.status
$$;

revoke execute on function public.invoice_status_counts(uuid) from public, anon, authenticated;
grant  execute on function public.invoice_status_counts(uuid) to service_role;
