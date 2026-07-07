---
name: project-ap29-customer-detail-cache-tag
description: Issue #29 customer detail reads moved to cached/tagged data-layer functions in src/lib/data/customer.ts
type: project
---

Issue #29 (slice of PRD #23, follows #28) extracted `customer-detail-container.tsx`'s two inline
`(supabase as any)` queries into `getCustomerDetail({ businessId, id })` and
`listCustomerInvoices({ businessId, customerId })` in `src/lib/data/customer.ts` — both
`"use cache"` + `cacheLife("minutes")`, tagged `customersTag`/`invoicesTag` respectively (detail
read uses customers tag, invoices read uses invoices tag — NOT both on either, per PRD).

**Why the `any` casts existed but weren't actually needed:** `src/lib/types/database.ts` already
has full `Row`/`Insert`/`Update` types for `customers` and `invoices` — the casts were stale/
unnecessary, not a real generic-type gap. Removing them and using `.select("col, col, ...")`
directly gave precise inferred row types with zero manual interface duplication (mirrors
`getInvoiceDetail`'s `InvoiceDetailRow = NonNullable<Awaited<ReturnType<typeof getInvoiceDetail>>>`
pattern).

**How to apply:** before reaching for a Pick<Database[...]> helper type or a hand-rolled row
interface when cleaning up an `any` cast, first check whether `database.types.ts` already covers
the table — regenerating types is very likely unnecessary. Container kept the aggregation/view-model
math (OPEN_STATUSES, rupee formatting, Customer/Invoice mapping) client-side in the container rather
than pushing it into the data module, since it combines two independent cached reads and is specific
to this one route — precise typing was the bar, not relocating all mapping logic.

**Known pre-existing quirk not fixed (out of scope):** the container's local `formatRupees` treats
`invoices.total`/`amount_paid` as whole rupees, while the rest of the app (`formatPaise` in
`src/lib/utils/format-currency.ts`, used by `listInvoicesPage`/dashboard) treats the same columns as
integer paise. Did not touch — flagged as a FOLLOW-UP, not a fix, since correcting it changes
displayed values (out of scope for a cache-tag refactor).

**Remaining `as any` in the repo:** `src/app/(app)/settings/actions.ts` still has one — it's a
Server Action, backend-engineer's lane, not touched here.
