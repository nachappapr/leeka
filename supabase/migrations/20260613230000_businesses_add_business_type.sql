-- Migration: add business_type to businesses and update create_business RPC
-- Adds nullable business_type column (CHECK-constrained to the 4 known ids)
-- and replaces the 5-arg create_business RPC with a 6-arg version that
-- requires the caller to supply a business type.

-- 1. Add the column (nullable — one existing row can't be backfilled with a real type)
ALTER TABLE public.businesses
  ADD COLUMN business_type text;

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_business_type_check
    CHECK (business_type IS NULL OR business_type IN ('retail', 'services', 'wholesale', 'food'));

-- 2. Drop the old 5-arg signature to avoid overload ambiguity
DROP FUNCTION IF EXISTS public.create_business(text, text, text, text, text);

-- 3. Create the new 6-arg version
CREATE OR REPLACE FUNCTION public.create_business(
  p_name          text,
  p_address       text,
  p_state_code    text,
  p_gstin         text,
  p_upi_id        text,
  p_business_type text
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

  -- 4. Duplicate guard: one business per user
  if exists (
    select 1
    from public.business_members
    where user_id = v_user_id
  ) then
    raise exception 'ALREADY_HAS_BUSINESS';
  end if;

  -- 5. Insert business row
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

  -- 6. Insert membership row (owner)
  insert into public.business_members (business_id, user_id, role)
  values (v_biz_id, v_user_id, 'owner');

  return v_biz_id;
end;
$$;

-- 4. Re-grant EXECUTE to the same roles as the original (mirrors AP-6 pattern)
REVOKE ALL ON FUNCTION public.create_business(text, text, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_business(text, text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_business(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_business(text, text, text, text, text, text) TO service_role;
