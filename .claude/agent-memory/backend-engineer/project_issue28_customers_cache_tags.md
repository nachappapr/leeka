---
name: issue28-customers-cache-tags
description: Customers cache-tag parity slice (issue #28) — customersTag added, listCustomersPage/businessHasCustomers cached reads, upsertCustomerAction switched to revalidateBusiness
metadata:
  type: project
---

Issue #28 (2026-07-07): customers surface had no cache tag, so added/edited customers required a full reload to show up. Fixed TypeScript-only, no DB changes.

- Added `customersTag(businessId)` to `src/lib/constants/cache-tags.ts` alongside `dashboardTag`/`invoicesTag`.
- `revalidateBusiness` (`src/lib/cache/revalidate-business.ts`) now also calls `updateTag(customersTag(businessId))` — all existing callers (invoice actions, webhooks, cron sweep) get customers invalidation for free.
- `listCustomersPage` (`src/lib/data/customer.ts`) converted to a cached read: `"use cache"` + `cacheLife("minutes")` + `cacheTag(customersTag(businessId))`, switched `createClient()` → `createAdminClient()` (session client is illegal inside a cache boundary; RPC already filters by `p_business_id` so this is the established safe-caching pattern, same as `listInvoicesPage`).
- `businessHasCustomers` gained a second tag via `cacheTag(dashboardTag(businessId), customersTag(businessId))` — confirmed `cacheTag` is variadic (`cacheTag(...tags: string[])` per `node_modules/next/dist/server/use-cache/cache-tag.d.ts`), so multiple tags in one call is the correct idiom, not multiple `cacheTag()` calls.
- `upsertCustomerAction` (`src/app/(app)/customers/actions.ts`) replaced 3 `revalidatePath` calls with a single `revalidateBusiness(businessId)`. `revalidatePath` import removed entirely (no other use in the file).

**Why:** Reads and writes had drifted onto two different invalidation mechanisms (raw `revalidatePath` vs the tag-based `revalidateBusiness` used everywhere else) — this closes that gap for customers, same as invoices/dashboard.

**How to apply:** Any new customer-surface cached read must carry `customersTag(businessId)`; any mutation touching customers must go through `revalidateBusiness(businessId)`, never a bespoke `revalidatePath`/`updateTag` call.

**Test gotcha:** a vitest module that imports anything from `src/lib/data/customer.ts` (even transitively, e.g. `upsertCustomerAction` imports `listCustomersPage`) now pulls in `createAdminClient` from `src/lib/supabase/admin.ts`, which validates env vars at module load via `serverEnv`. Must mock `@/lib/env.server` (`serverEnv: {}`, `isWhatsAppConfigured`/`isEmailConfigured` stubs) in the test file even if the test itself never touches WhatsApp/email — same pattern already used in `mark-invoice-unpaid-action.test.ts`.

New test file: `src/lib/__tests__/upsert-customer-action.test.ts` — 7 cases (2 validation-guard, 2 auth/business-guard, 3 RPC-behaviour including insert/edit/error paths), mirrors the `makeClient` widening pattern from `mark-invoice-unpaid-action.test.ts` but with `rpc` resolving `{ data, error }` directly (no `.single()` builder, since `upsertCustomerAction` awaits `supabase.rpc(...)` without chaining).
