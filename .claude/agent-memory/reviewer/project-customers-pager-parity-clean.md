---
name: project-customers-pager-parity-clean
description: Customers list pagination-parity unit (desktop pager + mobile load-more + real count) reviewed clean, no findings
type: project
---

Issue: bring customers list pagination to parity with invoices (desktop windowed
Prev/Next pager via TablePager, mobile-only load-more, real total count from
`countCustomers`). Reviewed 2026-07-08 against `src/lib/data/customer.ts`,
`customers-container.tsx`, `customers-list-client.tsx`, `customers-table.tsx`,
new `src/components/ui/custom/table-pager.tsx`, and the `invoices-table.tsx`
refactor to consume it. Verdict: PASS, no Critical/High findings.

**Why:** Confirms these patterns are sound and don't need re-litigating in future
diffs that touch the same files:
- `countCustomers` is tagged `customersTag(businessId)` and covered by the existing
  centralized `revalidateBusiness()` helper (already calls `updateTag(customersTag(...))`)
  — both `upsertCustomerAction` and `deleteCustomerAction` call it, so the new count
  read invalidates correctly on add/edit/delete without any new wiring needed.
- The resync-from-server-props block in `customers-list-client.tsx` (identity-compare
  `initialRows !== serverRows`) resets `pageIndex` to 0, matches
  `invoices-list-client.tsx` line-for-line (same `onPaginationChange` three-branch
  logic: page back / already-loaded-forward / fetch-more-then-advance).
- `TablePager` (`src/components/ui/custom/table-pager.tsx`) is a byte-identical
  extraction of the pre-existing raw-`<button>` pager markup from
  `invoices-table.tsx` (verified via `git diff HEAD -- invoices-table.tsx`) — the
  raw `<button>` (not `IconButton` from `ui/custom/icon-button.tsx`) predates this
  unit, so it is not a new wrapper-over-primitives violation; don't flag it fresh
  in future diffs that merely consume `TablePager`.
- `countCustomers` correctly uses the admin client (bypasses RLS) with explicit
  `.eq("business_id", businessId).is("deleted_at", null)` — matches
  `businessHasCustomers`'s existing filter shape.
- Container (`customers-container.tsx`) stays a Server Component doing
  `Promise.all([fetchCustomersFirstPage, fetchCustomersCount])`; admin client
  stays server-only (`import "server-only"` guard in `customer.ts`).

**How to apply:** When reviewing future customers/invoices list-pagination diffs,
treat this file set as the reference-correct pattern. A deviation from this
onPaginationChange shape (e.g. missing pageIndex reset, missing updateTag
coverage for a new mutation) is the thing to flag — not the shape itself.
