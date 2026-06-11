---
name: project-ap6-businesses
description: AP-6 settled decisions — businesses + business_members schema, RPC pattern, RLS, grant cleanup, GSTIN validation
metadata:
  type: project
---

## Settled decisions from AP-6 unit 1 (completed 2026-06-11)

**businesses table (binding — do not alter without new migration):**
- `id uuid pk default gen_random_uuid()`
- `owner_id uuid not null references public.profiles(id)`
- `name text not null`
- `address text`, `state_code text`, `gstin text`, `upi_id text`, `logo_url text` — all nullable
- `currency text not null default 'INR'`
- `gst_enabled boolean not null default true`
- `default_gst_rate numeric(5,2) default 18`
- `invoice_prefix text not null default 'INV'`
- `plan text not null default 'free'`
- `created_at timestamptz not null default now()`

**business_members table (binding):**
- `business_id uuid not null references public.businesses(id) on delete cascade`
- `user_id uuid not null references public.profiles(id) on delete cascade`
- `role text not null default 'owner'`
- Primary key: `(business_id, user_id)`

**Indexes:**
- `business_members_user_id_idx` on `business_members(user_id)` — primary RLS query path
- `business_members_business_id_idx` on `business_members(business_id)`
- `businesses_owner_id_idx` on `businesses(owner_id)` — for RPC duplicate guard

**RPC `create_business(p_name, p_address, p_state_code, p_gstin, p_upi_id)` → uuid:**
- `security definer`, `set search_path = public`
- Guards: auth.uid() not null → NOT_AUTHENTICATED; name blank → NAME_REQUIRED; existing membership → ALREADY_HAS_BUSINESS
- Atomically inserts businesses row (owner_id = auth.uid()) then business_members row (role='owner')
- Empty string args are coerced to NULL via `nullif(trim(coalesce(..., '')), '')`
- EXECUTE: revoked from public/anon, granted to authenticated only

**Generated RPC Args type uses `string` (not `string | null`)**
- The Server Action must pass `""` (empty string) not `null` for unset optional fields
- The RPC handles empty → NULL conversion server-side via nullif

**RLS design:**
- businesses INSERT: `with check (false)` for authenticated + anon deny — chicken-and-egg bypass via RPC only
- businesses SELECT/UPDATE: `id in (select business_id from business_members where user_id = auth.uid())`
- business_members INSERT/UPDATE/DELETE: all denied for authenticated + anon
- business_members SELECT: `user_id = auth.uid()` (own memberships only)

**Grants:**
- `authenticated`: SELECT + UPDATE on businesses; SELECT on business_members; no INSERT
- `anon`: nothing on either table
- Revoke pattern same as profiles: `revoke insert, delete, truncate, trigger, references` from anon+authenticated after explicit grants

**get_advisors WARN (expected, not a blocker):**
- `authenticated_security_definer_function_executable` on `create_business` — this is intentional design; the RPC IS meant to be callable by authenticated users. Do not suppress or fix.
- `auth_leaked_password_protection` — pre-existing, phone OTP project.

**TypeScript:**
- `src/lib/types/database.ts` regenerated 2026-06-11 — includes businesses, business_members, create_business RPC
- Schema: `src/lib/schema/business.ts` — BusinessSchema { name, address?, stateCode?, gstin?, upiId? }
- GSTIN validation: regex + mod-36 checksum in `validateGstinChecksum()`; state codes validated against INDIA_STATES array
- State codes constant: `src/lib/constants/business.ts` — 37 states/UTs as `{ code, name }[]`
- Server Action: `src/lib/actions/business.ts` — `createBusiness()` returns `CreateBusinessResult`
- Data helper: `src/lib/data/business.ts` — `getBusinessForUser()` returns `Business | null`

**Migration version:** `20260611203803`

**Why:** businesses INSERT denied to force all first-inserts through the security-definer RPC to solve the chicken-and-egg RLS problem (no membership row exists yet when bootstrapping).

**How to apply:** future multi-tenant tables that also need owner-bootstrap inserts should follow this same pattern: deny INSERT on the table, provide a security-definer RPC that does the atomic bootstrap.
