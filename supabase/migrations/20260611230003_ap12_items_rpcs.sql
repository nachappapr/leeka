-- AP-12 Sub-unit A: Items saved items CRUD RPCs
--
-- Adds:
--   1. Composite btree index on items(business_id, name) for list_items ORDER BY
--   2. upsert_item RPC  — INSERT or UPDATE an item (SECURITY INVOKER)
--   3. list_items RPC   — SELECT items for a business, ordered by name (SECURITY INVOKER)
--   4. delete_item RPC  — DELETE an item by id (SECURITY INVOKER)
--
-- Notes:
--   - RLS policies on items table are already complete (AP-8); do NOT touch them here
--   - All RPCs are SECURITY INVOKER with membership guard via business_members
--   - No GRANT TO anon — authenticated role only

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Composite btree index for list_items ORDER BY name
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS items_business_id_name_idx ON items(business_id, name);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. upsert_item RPC
--    INSERT when p_item_id is null, UPDATE otherwise.
--    Membership guard: caller must be in business_members for p_business_id.
--    Returns jsonb: { id, business_id, name, hsn_sac, unit,
--                     default_price, default_gst_rate, created_at }
--
-- NOTE: p_name is placed before p_item_id to satisfy Postgres's rule that
-- parameters without defaults must precede parameters with defaults.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.upsert_item(
  p_business_id     uuid,
  p_name            text,
  p_item_id         uuid    default null,
  p_hsn_sac         text    default null,
  p_default_price   int4    default 0,
  p_default_gst_rate numeric default 18,
  p_unit            text    default 'pcs'
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_id  uuid;
  v_row public.items%rowtype;
begin
  -- Membership guard: caller must be a member of the business
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  if p_item_id is null then
    -- INSERT path
    insert into public.items (
      business_id, name, hsn_sac, default_price, default_gst_rate, unit
    ) values (
      p_business_id, p_name, p_hsn_sac, p_default_price, p_default_gst_rate, p_unit
    )
    returning id into v_id;
  else
    -- UPDATE path: verify item belongs to this business
    if not exists (
      select 1 from public.items
      where id = p_item_id and business_id = p_business_id
    ) then
      raise exception 'item not found in this business';
    end if;

    update public.items
    set
      name              = p_name,
      hsn_sac           = p_hsn_sac,
      default_price     = p_default_price,
      default_gst_rate  = p_default_gst_rate,
      unit              = p_unit
    where id = p_item_id
      and business_id = p_business_id;

    v_id := p_item_id;
  end if;

  select * into v_row from public.items where id = v_id;

  return jsonb_build_object(
    'id',               v_row.id,
    'business_id',      v_row.business_id,
    'name',             v_row.name,
    'hsn_sac',          v_row.hsn_sac,
    'unit',             v_row.unit,
    'default_price',    v_row.default_price,
    'default_gst_rate', v_row.default_gst_rate,
    'created_at',       v_row.created_at
  );
end;
$$;

-- Authenticated-only: revoke public default, grant to authenticated
revoke execute on function public.upsert_item(
  uuid, text, uuid, text, int4, numeric, text
) from public, anon;
grant execute on function public.upsert_item(
  uuid, text, uuid, text, int4, numeric, text
) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. list_items RPC
--    SELECT all items for a business ordered by name.
--    Membership guard: caller must be in business_members for p_business_id.
--    Returns jsonb: json_agg of all item rows, or '[]'::jsonb if none.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.list_items(
  p_business_id uuid,
  p_limit       int default 200
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  -- Membership guard: caller must be a member of the business
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  select coalesce(
    json_agg(
      jsonb_build_object(
        'id',               sub.id,
        'business_id',      sub.business_id,
        'name',             sub.name,
        'hsn_sac',          sub.hsn_sac,
        'unit',             sub.unit,
        'default_price',    sub.default_price,
        'default_gst_rate', sub.default_gst_rate,
        'created_at',       sub.created_at
      )
      order by sub.name asc
    )::jsonb,
    '[]'::jsonb
  )
  into v_result
  from (
    select * from public.items
    where business_id = p_business_id
    order by name asc
    limit p_limit
  ) sub;

  return v_result;
end;
$$;

-- Authenticated-only: revoke public default, grant to authenticated
revoke execute on function public.list_items(uuid, int) from public, anon;
grant execute on function public.list_items(uuid, int) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. delete_item RPC
--    DELETE an item by id scoped to business.
--    Membership guard: caller must be in business_members for p_business_id.
--    Returns void.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.delete_item(
  p_business_id uuid,
  p_item_id     uuid
)
returns void
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

  delete from public.items
  where id = p_item_id
    and business_id = p_business_id;
end;
$$;

-- Authenticated-only: revoke public default, grant to authenticated
revoke execute on function public.delete_item(uuid, uuid) from public, anon;
grant execute on function public.delete_item(uuid, uuid) to authenticated;
