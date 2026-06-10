---
name: project-ap2-supabase-foundation
description: AP-2 settled decisions — env var names, migration workflow, Supabase project ref, and CI strategy
metadata:
  type: project
---

## Settled decisions from AP-2 (completed 2026-06-10)

**Env var contract (binding — user decision):**
- `NEXT_PUBLIC_SUPABASE_URL` — project REST URL, public, in `.env`, reused by server code (no separate `SUPABASE_URL`)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable key (sb_publishable_xxx), NOT anon key; public, in `.env`
- `SUPABASE_SERVICE_ROLE_KEY` — secret key, server-only, required (not optional), in `.env`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is GONE — do not reintroduce it anywhere

**Why:** User explicitly decided no anon key anywhere in this codebase. Use PUBLISHABLE_KEY throughout.

**Server env schema:** `SUPABASE_SERVICE_ROLE_KEY` is z.string().min(1) (required at startup). `requireServiceRoleKey()` helper removed — service role key is required unconditionally.

**Supabase project:** ref `lnzsizporrvdzlpxysfd`, URL `https://lnzsizporrvdzlpxysfd.supabase.co`

**Migration applied:** `20260610032202_foundation_extensions_and_app_meta` — enables citext + pg_trgm extensions, creates `public.app_meta` (key/value, RLS on, SELECT to authenticated, all writes denied to non-service_role).

**CI strategy:** `ci` job provides `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` via `vars.*` (non-secrets) and `SUPABASE_SERVICE_ROLE_KEY` via `secrets.*`. `migrations` job runs only on push to main via `supabase db push --include-all`.

**How to apply:** Any future env schema change must use these exact var names. No new table ships without RLS + explicit policies in the same migration file.
