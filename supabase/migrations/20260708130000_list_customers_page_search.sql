-- list_customers_page: add optional server-side search (p_query)
--
-- Context: the customers list (/customers) currently filters client-side,
-- which only searches the 25 rows on the current page. This migration moves
-- search server-side by adding an optional p_query parameter that matches
-- across name, city, and phone — strict parity with the old client-side
-- filter (no email/gstin match).
--
-- Trust model unchanged from 20260708120000_list_customers_page_security_definer:
--   * Still SECURITY DEFINER, still service_role-only EXECUTE. Authorization
--     happens server-side in resolveBusinessId before the cache boundary is
--     crossed; tenant isolation is enforced by the verified p_business_id,
--     not inside the RPC.
--
-- Changes vs 20260708120000 version:
--   * New parameter p_query text default null, appended last so existing
--     named-arg call sites (p_business_id, p_cursor_name, p_cursor_id,
--     p_limit) keep working unchanged.
--   * When p_query is null/blank, the filter has no effect — behavior is
--     byte-for-byte identical to the previous version.
--   * When non-empty, matches case-insensitively (ILIKE) as a substring
--     against c.name, c.city, c.phone (OR semantics). LIKE metacharacters
--     (\, %, _) in p_query are escaped so user input is always treated
--     literally (e.g. searching "100%" cannot turn into a wildcard).
--   * Keyset cursor clause, deleted_at filter, ordering, and the limit
--     clamp are otherwise unchanged — ordering is undisturbed by the
--     filter, so the cursor stays valid when paging a filtered result set.
--   * RETURNS TABLE column list unchanged. Per the incident on issue #9
--     (RETURNS TABLE OUT-column names enter the function body scope and
--     collide with bare column references, causing 42702), every column
--     reference in the body — including inside the new ILIKE clause — stays
--     table-qualified (c.name, c.city, c.phone).
--   * The prior 4-arg overload is DROPped before the 5-arg version is
--     created so PostgREST RPC dispatch is never ambiguous between the two
--     signatures (mirrors the create_business overload-ambiguity fix in
--     20260613250000_drop_create_business_6arg_overload.sql).

drop function if exists public.list_customers_page(uuid, text, uuid, int);

create or replace function public.list_customers_page(
  p_business_id   uuid,
  p_cursor_name   text default null,
  p_cursor_id     uuid default null,
  p_limit         int  default 25,
  p_query         text default null
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
  with q as (
    select nullif(trim(p_query), '') as raw
  ),
  esc as (
    select replace(replace(replace(q.raw, '\', '\\'), '%', '\%'), '_', '\_') as term
    from q
  )
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
  cross join esc
  where
    c.business_id = p_business_id
    -- Soft-delete filter
    and c.deleted_at is null
    -- Optional search: no-op when p_query is null/blank, otherwise a
    -- literal (metacharacter-escaped) case-insensitive substring match
    -- across name, city, phone
    and (
      esc.term is null
      or c.name  ilike '%' || esc.term || '%' escape '\'
      or c.city  ilike '%' || esc.term || '%' escape '\'
      or c.phone ilike '%' || esc.term || '%' escape '\'
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

revoke execute on function public.list_customers_page(uuid, text, uuid, int, text) from public, anon, authenticated;
grant  execute on function public.list_customers_page(uuid, text, uuid, int, text) to service_role;
