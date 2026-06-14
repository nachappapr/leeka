-- Fix upsert_customer: normalize blank optional text params to NULL so they
-- satisfy customers_gstin_format (and keep other optional columns clean).
-- Pattern mirrors create_business: nullif(trim(coalesce(p_x, '')), '').
-- p_name is NOT normalized (required, must remain non-null).
-- p_phone IS normalized (column is nullable; blank phone → NULL is correct).

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
  v_id      uuid;
  v_row     public.customers%rowtype;
  v_phone   text := nullif(trim(coalesce(p_phone,           '')), '');
  v_email   text := nullif(trim(coalesce(p_email,           '')), '');
  v_gstin   text := nullif(trim(coalesce(p_gstin,           '')), '');
  v_sc      text := nullif(trim(coalesce(p_state_code,      '')), '');
  v_city    text := nullif(trim(coalesce(p_city,            '')), '');
  v_addr    text := nullif(trim(coalesce(p_billing_address, '')), '');
  v_notes   text := nullif(trim(coalesce(p_notes,           '')), '');
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
      p_business_id, p_name, v_phone, v_email, v_gstin,
      v_sc, v_city, v_addr, v_notes
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
      phone           = v_phone,
      email           = v_email,
      gstin           = v_gstin,
      state_code      = v_sc,
      city            = v_city,
      billing_address = v_addr,
      notes           = v_notes
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

-- Re-assert grants (create or replace does not drop existing grants but is
-- explicit here to match the original migration's grant/revoke pattern).
revoke execute on function public.upsert_customer(
  uuid, text, uuid, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.upsert_customer(
  uuid, text, uuid, text, text, text, text, text, text, text
) to authenticated;
