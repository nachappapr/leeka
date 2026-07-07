---
name: project-revalidate-business-centralized-tags
description: revalidateBusiness() is the single centralized helper for dashboard+invoices+customers cache tags — confirmed correct pattern for issue #28
type: project
---

`src/lib/cache/revalidate-business.ts` `revalidateBusiness(businessId)` calls `updateTag()` for
`dashboardTag`, `invoicesTag`, and (as of issue #28, 2026-07-07) `customersTag`. Every write-path
Server Action / route handler that mutates a business's invoices or customers calls this single
helper instead of ad-hoc `updateTag`/`revalidatePath` calls.

`src/lib/data/customer.ts` `listCustomersPage` was converted to `"use cache"` mirroring
`listInvoicesPage` in `src/lib/data/invoice.ts` exactly: businessId is resolved from the session
cookie OUTSIDE the cache boundary (in `fetchCustomersFirstPage` / `fetchCustomersPage`, both using
the session `createClient()`), then passed in as an explicit arg; the cached function itself uses
`createAdminClient()` and filters every query/RPC by the explicit `businessId` arg — never derives
it from cookies inside the cache boundary. This is the established, accepted pattern (first seen
in invoices, now mirrored in customers) — do not flag it as a service-role violation.

**Why:** centralizing in one helper means every new cache-tag surface (dashboard, invoices,
customers, and whatever's next) is added in exactly one place, so a future write path can't forget
to invalidate a tag it doesn't know about yet.

**How to apply:** when a future unit adds a new tagged read surface whose data also changes via
existing mutations (e.g. a customer delete, a dashboard "recent customers" widget), check whether
`revalidateBusiness` should gain that tag rather than the new mutation adding its own `updateTag`
call. If a mutation touches business data but calls `updateTag` directly instead of going through
`revalidateBusiness`, treat that as a Medium (#13 consistency) unless there's a stated reason
(e.g. `sendInvoice`/reminder dispatch actions intentionally skip revalidation — "dispatch logging
only, matches sendInvoice precedent" — that's an accepted exception, not a bug).
