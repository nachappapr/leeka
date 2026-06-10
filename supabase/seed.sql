-- ============================================================
-- ArthaPatra -- development seed
-- Idempotent: safe to run multiple times without duplication.
-- Uses ON CONFLICT DO UPDATE / DO NOTHING throughout.
-- Never run against production; dev-safe data only.
-- ============================================================

-- app_meta: ensure baseline config rows exist
insert into public.app_meta (key, value) values
  ('schema_version', '20260610032202'),
  ('app_name',       'arthapatra'),
  ('seed_ran_at',    now()::text)
on conflict (key) do update set
  value      = excluded.value,
  updated_at = now();

-- Future seed blocks for users, customers, invoices etc.
-- go here, each wrapped in ON CONFLICT DO NOTHING / DO UPDATE
-- so the file stays idempotent.
