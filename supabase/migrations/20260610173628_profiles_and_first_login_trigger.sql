-- ============================================================
-- AP-5: profiles table + first-login trigger
-- ============================================================

-- ------------------------------------------------------------
-- 1. profiles table
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid        primary key references auth.users on delete cascade,
  phone        text        unique not null,
  display_name text,
  language     text        not null default 'en',
  created_at   timestamptz not null default now(),
  constraint profiles_language_check check (language in ('en','hi','ta','mr','bn','gu'))
);

-- ------------------------------------------------------------
-- 2. RLS
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

-- SELECT: a user may read their own row only
create policy "profiles: owner can select"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- INSERT: deny all direct client inserts (trigger handles inserts only)
create policy "profiles: no direct insert"
  on public.profiles
  for insert
  to authenticated
  with check (false);

-- UPDATE: a user may update their own row only
create policy "profiles: owner can update"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- DELETE: deny all authenticated deletes
create policy "profiles: no delete"
  on public.profiles
  for delete
  to authenticated
  using (false);

-- Explicit anon deny policies (defense-in-depth — self-contained independent of grant state)
create policy "profiles: anon deny select"
  on public.profiles
  for select
  to anon
  using (false);

create policy "profiles: anon deny insert"
  on public.profiles
  for insert
  to anon
  with check (false);

create policy "profiles: anon deny update"
  on public.profiles
  for update
  to anon
  using (false)
  with check (false);

create policy "profiles: anon deny delete"
  on public.profiles
  for delete
  to anon
  using (false);

-- ------------------------------------------------------------
-- 3. Grants — expose table to Data API for authenticated role only
--    (anon has no access; authenticated gets select + update only)
-- ------------------------------------------------------------
grant select, update on public.profiles to authenticated;

-- Revoke excess default grants that Supabase's postgres role adds
revoke insert, delete, truncate, trigger, references on public.profiles from anon;
revoke insert, delete, truncate, trigger, references on public.profiles from authenticated;
revoke select, update on public.profiles from anon;

-- ------------------------------------------------------------
-- 4. First-login trigger (security definer, runs as postgres)
--    Inserts a profiles row on every new auth.users row.
--    Idempotent via ON CONFLICT DO NOTHING.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, language)
  values (
    new.id,
    coalesce(new.phone, ''),
    'en'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Revoke broad public execute so only the trigger mechanism invokes it
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 5. Index on phone for lookups by phone number
-- ------------------------------------------------------------
create index if not exists profiles_phone_idx on public.profiles (phone);
