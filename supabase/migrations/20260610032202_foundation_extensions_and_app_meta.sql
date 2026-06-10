-- ============================================================
-- AP-2: Foundation — extensions + app_meta healthcheck table
-- ============================================================

-- Enable extensions used across the app
-- citext: case-insensitive text (email addresses, usernames)
create extension if not exists citext with schema extensions;

-- pg_trgm: trigram similarity for fuzzy search
create extension if not exists pg_trgm with schema extensions;

-- ------------------------------------------------------------
-- app_meta: lightweight key/value store for app-level config
-- and healthcheck. Readable by any authenticated user;
-- only service_role may write (service_role bypasses RLS).
-- ------------------------------------------------------------
create table if not exists public.app_meta (
  key        text primary key,
  value      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: every table in the public schema ships with RLS enabled
alter table public.app_meta enable row level security;

-- SELECT: any authenticated user may read app metadata
create policy "app_meta: authenticated users can read"
  on public.app_meta
  for select
  to authenticated
  using (true);

-- INSERT: deny all non-service_role (service_role bypasses RLS)
create policy "app_meta: no public insert"
  on public.app_meta
  for insert
  to authenticated
  with check (false);

-- UPDATE: deny all non-service_role; both USING + WITH CHECK required
create policy "app_meta: no public update"
  on public.app_meta
  for update
  to authenticated
  using (false)
  with check (false);

-- DELETE: deny all non-service_role
create policy "app_meta: no public delete"
  on public.app_meta
  for delete
  to authenticated
  using (false);

-- Seed the schema version so healthcheck queries have a row to read
insert into public.app_meta (key, value) values
  ('schema_version', '20260610032202'),
  ('app_name',       'arthapatra')
on conflict (key) do update set
  value      = excluded.value,
  updated_at = now();
