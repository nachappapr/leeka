-- Extends create_business to also persist the owner's display_name on profiles
-- in the same atomic transaction. Adds p_display_name text parameter;
-- all existing guards and exception codes are preserved unchanged.

CREATE OR REPLACE FUNCTION public.create_business(
  p_name          text,
  p_address       text,
  p_state_code    text,
  p_gstin         text,
  p_upi_id        text,
  p_business_type text,
  p_display_name  text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  v_user_id   uuid;
  v_biz_id    uuid;
begin
  -- 1. Auth guard: caller must be authenticated
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- 2. Name guard: name must not be blank
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'NAME_REQUIRED';
  end if;

  -- 3. Business type guard: type is required on create
  if trim(coalesce(p_business_type, '')) = '' then
    raise exception 'BUSINESS_TYPE_REQUIRED';
  end if;

  -- 4. Business type value guard
  if p_business_type not in ('retail', 'services', 'wholesale', 'food') then
    raise exception 'INVALID_BUSINESS_TYPE';
  end if;

  -- 5. Duplicate guard: one business per user
  if exists (
    select 1
    from public.business_members
    where user_id = v_user_id
  ) then
    raise exception 'ALREADY_HAS_BUSINESS';
  end if;

  -- 6. Insert business row
  insert into public.businesses (
    owner_id,
    name,
    address,
    state_code,
    gstin,
    upi_id,
    business_type
  )
  values (
    v_user_id,
    trim(p_name),
    nullif(trim(coalesce(p_address, '')), ''),
    nullif(trim(coalesce(p_state_code, '')), ''),
    nullif(trim(coalesce(p_gstin, '')), ''),
    nullif(trim(coalesce(p_upi_id, '')), ''),
    p_business_type
  )
  returning id into v_biz_id;

  -- 7. Insert membership row (owner)
  insert into public.business_members (business_id, user_id, role)
  values (v_biz_id, v_user_id, 'owner');

  -- 8. Persist display_name on the caller's profile when provided.
  --    nullif(trim(...), '') coerces blank/whitespace to NULL so an empty
  --    p_display_name leaves any existing display_name untouched.
  if nullif(trim(coalesce(p_display_name, '')), '') is not null then
    update public.profiles
    set display_name = trim(p_display_name)
    where id = v_user_id;
  end if;

  return v_biz_id;
end;
$$;

-- Re-grant EXECUTE to authenticated (SECURITY DEFINER functions lose grants on replace)
REVOKE EXECUTE ON FUNCTION public.create_business(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_business(text, text, text, text, text, text, text) TO authenticated;
