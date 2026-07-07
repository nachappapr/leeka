---
name: issue30-customer-soft-delete
description: Issue #30 backend half — customers.deleted_at, delete_customer RPC, list_customers_page filter, deleteCustomerAction
type: project
---

Backend half of issue #30 (2026-07-07): real customer soft delete.

**Migration:** `supabase/migrations/20260707100000_customer_soft_delete.sql`, applied directly to the main project (branch creation unavailable — `create_branch` errors "Cost confirmation ID does not match" and there is no `confirm_cost` tool registered in this environment; this repeats the finding already recorded in [[project_cache_invalidation_invoices]] / AP-28. Standing Option-B authorization covers this).

- `customers.deleted_at timestamptz` — nullable, no default.
- `delete_customer(p_business_id, p_customer_id)` — **returns boolean**, not `RETURNS TABLE`, specifically to sidestep the 42702 OUT-column trap ([[project ap8 tenant tables]] lifecycle note). `SECURITY INVOKER` + explicit `business_members` membership guard in the body (same pattern as `upsert_customer`/`search_customers`), on top of the pre-existing `customers` RLS `UPDATE` policy which already scopes to membership. Idempotent: deleting an already-deleted or nonexistent row just returns `false` (0 rows updated), no exception.
- `list_customers_page` — CREATE OR REPLACE, added table-qualified `and c.deleted_at is null`. Verified via `pg_get_functiondef` that the **live** function body (not just the ap42 migration file) was still `SECURITY INVOKER` with the `auth.uid()` membership subquery, unchanged since ap42 — confirmed no drift to fix.

**Grants:** `revoke ... from public, anon; grant ... to authenticated` on both new/changed functions — same as every prior customer RPC. `service_role` shows up in `information_schema.routine_privileges` for every function in this project (including `upsert_customer`) even without an explicit grant — this is Supabase's default-privilege behavior (`ALTER DEFAULT PRIVILEGES ... GRANT ... TO service_role` at project bootstrap), not something each migration needs to (or should) touch.

**Verification technique for RLS/membership-guarded RPCs via `execute_sql` (no branch, no app layer):** `execute_sql` runs as `postgres` with no JWT, so `auth.uid()` is NULL by default and any membership-guarded RPC will always raise "not a member". To exercise the real caller path: `set local role authenticated; set local request.jwt.claims = '{"sub":"<user_id>","role":"authenticated"}';` before the RPC call, all within the same `execute_sql` call (each call appears to be its own session — SET LOCAL doesn't persist across separate tool calls, only within one). Confirmed `auth.uid()` resolves correctly and RLS + the function's own membership check both pass.

**No unique constraint on `customers.phone`** — confirmed via `list_tables` (nullable, no `unique` in options) and via direct test: soft-deleted a customer, then `upsert_customer`'d a brand-new row with the identical phone number; succeeded with a new `id`, no resurrection logic needed or added.

**deleteCustomerAction** (`src/app/(app)/customers/actions.ts`): mirrors `markInvoiceUnpaid`'s shape exactly — zod `uuid()` validation before any Supabase call, local `getBusinessId` helper (already in this file), `supabase.rpc("delete_customer", ...)` **without** `.single()` (return is a scalar boolean, not a row), `revalidateBusiness(businessId)` on success only. Test file `src/lib/__tests__/delete-customer-action.test.ts` mirrors `mark-invoice-unpaid-action.test.ts`'s `makeClient` structure but with the simpler non-`.single()` rpc mock shape.

**Types:** `src/lib/types/database.ts` regenerated via `mcp__supabase__generate_typescript_types` and hand-reformatted to match the repo's existing semicolon/quote style (the raw generator output uses a different formatting convention — comma-separated, no trailing semicolons — than what's checked in; rewrite it in the repo's style rather than pasting raw output, or `pnpm lint`/`prettier` will flag it).

**Out of scope (per issue #30 fence, left untouched):** `search_customers` does not filter `deleted_at` — noted as a FOLLOW-UP only, not built. Frontend read-layer `.is("deleted_at", null)` filters, sheet confirm UI, restore flow, per-customer aggregates are a separate frontend pass.

**How to apply:** Any future customer-surface RPC touching a soft-deletable row must add `deleted_at is null` explicitly — there is no view or RLS-level filter doing this automatically, so it's easy to forget in a new read path (e.g. `search_all`, `search_customers`).
