-- Issue #30: Real customer soft delete (backend half)
--
-- Adds:
--   1. customers.deleted_at (nullable timestamptz, no default)
--   2. delete_customer(p_business_id, p_customer_id) RPC — business-scoped soft delete
--   3. list_customers_page(...) — CREATE OR REPLACE adding `and c.deleted_at is null`
--
-- Security model (matches upsert_customer / search_customers / list_customers_page):
--   SECURITY INVOKER + explicit business_members membership guard in the function body,
--   on top of RLS ("tenant: owner update" already scopes UPDATE to the caller's business).
--   No RETURNS TABLE here (delete_customer returns boolean) so the OUT-column /
--   unqualified-reference 42702 trap documented in 20260628020000 does not apply.
--
-- Out of scope for this migration (per issue #30 fence): restore flow, per-customer
-- aggregates, header total count, search_customers / global search deleted_at filtering.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. customers.deleted_at
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.customers add column if not exists deleted_at timestamptz;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. delete_customer
--    Soft-deletes a customer scoped to the caller's business. Idempotent: an
--    already-deleted or not-found row simply updates zero rows (returns false).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.delete_customer(
  p_business_id uuid,
  p_customer_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  -- Membership guard: caller must be a member of the business
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  update public.customers
  set deleted_at = now()
  where id = p_customer_id
    and business_id = p_business_id
    and deleted_at is null;

  return found;
end;
$$;

revoke execute on function public.delete_customer(uuid, uuid) from public, anon;
grant  execute on function public.delete_customer(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. list_customers_page — exclude soft-deleted rows
--    Body is otherwise byte-for-byte identical to the live definition
--    (20260612204036_ap42_list_pagination); only the deleted_at filter is added.
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

revoke execute on function public.list_customers_page(uuid, text, uuid, int) from public, anon;
grant  execute on function public.list_customers_page(uuid, text, uuid, int) to authenticated;
