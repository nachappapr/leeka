---
name: project-ap5-profiles
description: AP-5 settled decisions — profiles table schema, trigger pattern, RLS policies, grant cleanup
metadata:
  type: project
---

## Settled decisions from AP-5 (completed 2026-06-10)

**profiles table (binding — do not alter without new migration):**
- `id uuid pk references auth.users on delete cascade`
- `phone text unique not null`
- `display_name text` (nullable — captured in Unit 2 onboarding step)
- `language text not null default 'en'` + CHECK constraint: `('en','hi','ta','mr','bn','gu')`
- `created_at timestamptz not null default now()`

**First-login trigger:**
- Function: `public.handle_new_user()` — `SECURITY DEFINER`, `SET search_path = public`
- Trigger: `on_auth_user_created` AFTER INSERT on `auth.users` FOR EACH ROW
- Uses `ON CONFLICT (id) DO NOTHING` for idempotency
- `phone` column populated from `NEW.phone` (coalesce to '' if null — phone is always set by OTP auth)
- `EXECUTE` revoked from `public`, `anon`, `authenticated` — only trigger mechanism can call it

**RLS policies:**
- SELECT: `to authenticated using ((select auth.uid()) = id)`
- INSERT: `to authenticated with check (false)` — trigger-only path, no client insert allowed
- UPDATE: `to authenticated using + with check ((select auth.uid()) = id)`
- DELETE: `to authenticated using (false)`

**Grants (final state after revoke cleanup):**
- `authenticated`: SELECT + UPDATE only
- `anon`: nothing
- Supabase's default postgres-role grants everything to anon+authenticated on public schema — always revoke excess after explicit grants on new tables

**Migration version:** `20260610173628`

**RLS policies — anon deny layer added in Unit 2a (2026-06-10):**
- All four operations (SELECT/INSERT/UPDATE/DELETE) now have explicit `to anon using(false)` / `with check(false)` policies in the same migration file.
- Pattern: always pair authenticated policies with matching anon deny policies on user-scoped tables — defense-in-depth independent of grant state.

**Data access helper:** `src/lib/data/profile.ts` — `getProfile()` returns `Profile | null` for current user (RLS-scoped). PGRST116 (no rows) is a non-error case — returns null silently.

**Write path (AP-5 Unit 2a):**
- Schema: `src/lib/schema/profile.ts` — `ProfileStepSchema` { displayName: string, min 1, max 80, trimmed }. Exported type: `ProfileStepFormData`.
- Server Action: `src/lib/actions/profile.ts` — `saveDisplayName(displayName: string): Promise<AuthActionResult>`. Uses RLS-scoped server client (never admin). Validates with `ProfileStepSchema.safeParse` before any Supabase call. Auth check via `supabase.auth.getUser()` — returns `{ ok: false, error: "Not authenticated" }` for no-session callers. Only writes `display_name`; phone/id/language never accepted from caller.
- Zod v4: `ZodError` uses `.issues[0]?.message` not `.errors[0]?.message` (`.errors` does not exist in v4 — tsc will catch this).

**Why:** First-login profile creation is a trigger (not ensureProfile() Server Action) by orchestrator decision — avoids race conditions and ensures the row exists before any server-side read.

**How to apply:** Any future schema change to profiles goes in a new migration. The trigger function can be updated via `CREATE OR REPLACE FUNCTION`. The `anon`-role revoke pattern should be applied to every new user-scoped table.
