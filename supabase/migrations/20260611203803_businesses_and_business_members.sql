-- ============================================================
-- AP-6: businesses + business_members tables, RLS, RPC
-- ============================================================

-- ------------------------------------------------------------
-- 1. businesses table
-- ------------------------------------------------------------
create table public.businesses (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(id),
  name             text not null,
  address          text,
  state_code       text,
  gstin            text,
  upi_id           text,
  logo_url         text,
  currency         text not null default 'INR',
  gst_enabled      boolean not null default true,
  default_gst_rate numeric(5,2) default 18,
  invoice_prefix   text not null default 'INV',
  plan             text not null default 'free',
  created_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. business_members table
-- ------------------------------------------------------------
create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null default 'owner',
  primary key (business_id, user_id)
);

-- ------------------------------------------------------------
-- 3. Indexes
-- ------------------------------------------------------------
-- business_members.user_id — primary query path (RLS + getBusiness)
create index if not exists business_members_user_id_idx
  on public.business_members (user_id);

-- business_members.business_id — for cascade/join lookups
create index if not exists business_members_business_id_idx
  on public.business_members (business_id);

-- businesses.owner_id — for duplicate-check in RPC
create index if not exists businesses_owner_id_idx
  on public.businesses (owner_id);

-- ------------------------------------------------------------
-- 4. RLS — businesses
-- ------------------------------------------------------------
alter table public.businesses enable row level security;

-- SELECT: members can read their own business rows
create policy "businesses: member can select"
  on public.businesses
  for select
  to authenticated
  using (
    id in (
      select business_id
      from public.business_members
      where user_id = (select auth.uid())
    )
  );

-- INSERT: deny all direct inserts — only RPC create_business inserts
create policy "businesses: no direct insert"
  on public.businesses
  for insert
  to authenticated
  with check (false);

-- UPDATE: members can update their own business rows
create policy "businesses: member can update"
  on public.businesses
  for update
  to authenticated
  using (
    id in (
      select business_id
      from public.business_members
      where user_id = (select auth.uid())
    )
  );

-- DELETE: deny all
create policy "businesses: no delete"
  on public.businesses
  for delete
  to authenticated
  using (false);

-- Anon deny — defense-in-depth
create policy "businesses: anon deny select"
  on public.businesses
  for select
  to anon
  using (false);

create policy "businesses: anon deny insert"
  on public.businesses
  for insert
  to anon
  with check (false);

create policy "businesses: anon deny update"
  on public.businesses
  for update
  to anon
  using (false)
  with check (false);

create policy "businesses: anon deny delete"
  on public.businesses
  for delete
  to anon
  using (false);

-- ------------------------------------------------------------
-- 5. RLS — business_members
-- ------------------------------------------------------------
alter table public.business_members enable row level security;

-- SELECT: a user can see their own memberships
create policy "business_members: owner can select"
  on public.business_members
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- INSERT: deny all — only RPC inserts
create policy "business_members: no direct insert"
  on public.business_members
  for insert
  to authenticated
  with check (false);

-- UPDATE: deny all
create policy "business_members: no update"
  on public.business_members
  for update
  to authenticated
  using (false);

-- DELETE: deny all
create policy "business_members: no delete"
  on public.business_members
  for delete
  to authenticated
  using (false);

-- Anon deny — defense-in-depth
create policy "business_members: anon deny select"
  on public.business_members
  for select
  to anon
  using (false);

create policy "business_members: anon deny insert"
  on public.business_members
  for insert
  to anon
  with check (false);

create policy "business_members: anon deny update"
  on public.business_members
  for update
  to anon
  using (false)
  with check (false);

create policy "business_members: anon deny delete"
  on public.business_members
  for delete
  to anon
  using (false);

-- ------------------------------------------------------------
-- 6. Grants
-- ------------------------------------------------------------
-- authenticated: select + update on businesses; select on business_members
-- No direct insert grant — all inserts go through RPC (security definer)
grant select, update on public.businesses to authenticated;
grant select on public.business_members to authenticated;

-- Revoke excess defaults that Supabase's postgres role adds
revoke insert, delete, truncate, trigger, references on public.businesses from anon;
revoke insert, delete, truncate, trigger, references on public.businesses from authenticated;
revoke select, update on public.businesses from anon;

revoke insert, update, delete, truncate, trigger, references on public.business_members from anon;
revoke insert, update, delete, truncate, trigger, references on public.business_members from authenticated;
revoke select on public.business_members from anon;

-- ------------------------------------------------------------
-- 7. RPC: create_business
--    Security definer — bypasses RLS to atomically insert both
--    businesses + business_members rows (owner bootstrap).
--    Called by authenticated users; auth.uid() is available inside.
-- ------------------------------------------------------------
create or replace function public.create_business(
  p_name       text,
  p_address    text,
  p_state_code text,
  p_gstin      text,
  p_upi_id     text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
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

  -- 3. Duplicate guard: one business per user
  if exists (
    select 1
    from public.business_members
    where user_id = v_user_id
  ) then
    raise exception 'ALREADY_HAS_BUSINESS';
  end if;

  -- 4. Insert business row
  insert into public.businesses (
    owner_id,
    name,
    address,
    state_code,
    gstin,
    upi_id
  )
  values (
    v_user_id,
    trim(p_name),
    nullif(trim(coalesce(p_address, '')), ''),
    nullif(trim(coalesce(p_state_code, '')), ''),
    nullif(trim(coalesce(p_gstin, '')), ''),
    nullif(trim(coalesce(p_upi_id, '')), '')
  )
  returning id into v_biz_id;

  -- 5. Insert membership row (owner)
  insert into public.business_members (business_id, user_id, role)
  values (v_biz_id, v_user_id, 'owner');

  return v_biz_id;
end;
$$;

-- Revoke broad public/anon execute; grant only to authenticated
revoke execute on function public.create_business(text, text, text, text, text) from public;
revoke execute on function public.create_business(text, text, text, text, text) from anon;
revoke execute on function public.create_business(text, text, text, text, text) from authenticated;
grant execute on function public.create_business(text, text, text, text, text) to authenticated;
