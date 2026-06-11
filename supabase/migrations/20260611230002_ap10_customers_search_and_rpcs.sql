-- AP-10 Unit 1: Customer search infrastructure + CRUD RPCs
--
-- Adds:
--   1. GIN trigram index on customers(name) for ilike / trigram search
--   2. Composite btree index on customers(business_id, name) for list queries
--   3. GSTIN CHECK constraint (NULL allowed, validates format when present)
--   4. upsert_customer RPC  — INSERT or UPDATE a customer (SECURITY INVOKER)
--   5. search_customers RPC — ilike search scoped to a business (SECURITY INVOKER)
--
-- Notes:
--   - pg_trgm is already installed in the extensions schema (verified AP-10 pre-flight)
--   - RLS policies on customers table are already complete (AP-8); do NOT touch them here
--   - Both RPCs are SECURITY INVOKER with membership guard via business_members
--   - No GRANT TO anon — authenticated role only

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. GIN trigram index for name search
-- ─────────────────────────────────────────────────────────────────────────────
create index customers_name_trgm_idx on public.customers
  using gin (name extensions.gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Composite btree index for list queries (business_id + name ordering)
-- ─────────────────────────────────────────────────────────────────────────────
create index customers_business_name_idx on public.customers (business_id, name);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. GSTIN CHECK constraint (NULL allowed, validates format when present)
--    Pattern: 2-digit state code + 5 alpha + 4 digit + 1 alpha + 1 alphanum +
--             literal Z + 1 alphanum
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.customers
  add constraint customers_gstin_format
  check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. upsert_customer RPC
--    INSERT when p_customer_id is null, UPDATE otherwise.
--    Membership guard: caller must be in business_members for p_business_id.
--    Returns jsonb: { id, name, phone, email, gstin, state_code, city,
--                     billing_address }
--
-- NOTE: p_name is placed before p_customer_id to satisfy Postgres's rule that
-- parameters without defaults must precede parameters with defaults.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.upsert_customer(
  p_business_id     uuid,
  p_name            text,
  p_customer_id     uuid    default null,
  p_phone           text    default null,
  p_email           text    default null,
  p_gstin           text    default null,
  p_state_code      text    default null,
  p_city            text    default null,
  p_billing_address text    default null,
  p_notes           text    default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_id  uuid;
  v_row public.customers%rowtype;
begin
  -- Membership guard: caller must be a member of the business
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  if p_customer_id is null then
    -- INSERT path
    insert into public.customers (
      business_id, name, phone, email, gstin,
      state_code, city, billing_address, notes
    ) values (
      p_business_id, p_name, p_phone, p_email, p_gstin,
      p_state_code, p_city, p_billing_address, p_notes
    )
    returning id into v_id;
  else
    -- UPDATE path: verify customer belongs to this business
    if not exists (
      select 1 from public.customers
      where id = p_customer_id and business_id = p_business_id
    ) then
      raise exception 'customer not found in this business';
    end if;

    update public.customers
    set
      name            = p_name,
      phone           = p_phone,
      email           = p_email,
      gstin           = p_gstin,
      state_code      = p_state_code,
      city            = p_city,
      billing_address = p_billing_address,
      notes           = p_notes
    where id = p_customer_id
      and business_id = p_business_id;

    v_id := p_customer_id;
  end if;

  select * into v_row from public.customers where id = v_id;

  return jsonb_build_object(
    'id',              v_row.id,
    'name',            v_row.name,
    'phone',           v_row.phone,
    'email',           v_row.email,
    'gstin',           v_row.gstin,
    'state_code',      v_row.state_code,
    'city',            v_row.city,
    'billing_address', v_row.billing_address
  );
end;
$$;

-- Authenticated-only: revoke public default, grant to authenticated
revoke execute on function public.upsert_customer(
  uuid, text, uuid, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.upsert_customer(
  uuid, text, uuid, text, text, text, text, text, text, text
) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. search_customers RPC
--    ilike search on name scoped to p_business_id.
--    Empty p_query returns all customers for the business (up to p_limit).
--    Membership guard: caller must be in business_members for p_business_id.
--    Returns setof jsonb: { id, name, phone, email, state_code }
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.search_customers(
  p_business_id uuid,
  p_query       text,
  p_limit       int  default 20
)
returns setof jsonb
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

  return query
  select jsonb_build_object(
    'id',         c.id,
    'name',       c.name,
    'phone',      c.phone,
    'email',      c.email,
    'state_code', c.state_code
  )
  from public.customers c
  where c.business_id = p_business_id
    and (p_query = '' or c.name ilike '%' || p_query || '%')
  order by c.name
  limit p_limit;
end;
$$;

-- Authenticated-only: revoke public default, grant to authenticated
revoke execute on function public.search_customers(uuid, text, int) from public, anon;
grant execute on function public.search_customers(uuid, text, int) to authenticated;
