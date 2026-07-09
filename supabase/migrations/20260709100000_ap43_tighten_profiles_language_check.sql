-- ============================================================
-- AP-43: tighten profiles.language CHECK to supported Locales only
-- ============================================================
-- The app only ships three Locales (en, hi, kn). The original
-- constraint from AP-5 allowed six values from an earlier scoping
-- (en, hi, ta, mr, bn, gu). Narrow it so an out-of-range Locale can
-- never be persisted.

-- ------------------------------------------------------------
-- 1. Defensively coerce any non-conforming row to 'en' before
--    altering the constraint. No row is expected to violate the
--    narrowed set today (the language chooser never persisted a
--    value outside en/hi/kn), but this makes the migration safe
--    to run regardless.
-- ------------------------------------------------------------
update public.profiles
set language = 'en'
where language not in ('en', 'hi', 'kn');

-- ------------------------------------------------------------
-- 2. Drop and re-add the constraint, narrowed to (en, hi, kn)
-- ------------------------------------------------------------
alter table public.profiles
  drop constraint if exists profiles_language_check;

alter table public.profiles
  add constraint profiles_language_check check (language in ('en', 'hi', 'kn'));
