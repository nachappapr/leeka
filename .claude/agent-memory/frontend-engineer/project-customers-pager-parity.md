---
name: project-customers-pager-parity
description: Customers list pager parity with invoices (2026-07-08) — countCustomers/fetchCustomersCount data layer, shared TablePager extraction
type: project
---

Brought `src/components/customers/*` pagination to parity with invoices: desktop windowed Prev/Next pager (25/page), "Load more" mobile-only.

- Added `countCustomers({businessId})` (cached, mirrors `businessHasCustomers`) + uncached `fetchCustomersCount()` wrapper to `src/lib/data/customer.ts`. Container (`customers-container.tsx`) fetches it in `Promise.all` alongside `fetchCustomersFirstPage`, mirroring `invoices-container.tsx`'s `Promise.all` shape.
- `customers-list-client.tsx` now carries `pageIndex` + `desktopRows` slicing + `onPaginationChange` (same three-branch back/within-loaded/fetch-then-advance logic as `invoices-list-client.tsx`), and wraps `CustomersMobileList` + `CustomersLoadMore` in `min-mobile:hidden` — previously `CustomersLoadMore` rendered on desktop too (a real bug).
- **New shared primitive**: `src/components/ui/custom/table-pager.tsx` (`TablePager`) — extracted the Prev/Next pager markup that was duplicated verbatim between `invoices-table.tsx` and `customers-table.tsx`. Both tables now consume the same component instead of forking it. Triggered by hitting ESLint's `max-lines-per-function` (200) on `CustomersTable` once the pager + existing search-bar code combined — extracting was the correct fix, not a budget workaround. Any *third* table needing a Prev/Next pager should reach for `TablePager` first.
- `countCustomers`/`businessHasCustomers` share the identical count-query shape (`select("id", {count:"exact",head:true}).eq("business_id",...).is("deleted_at",null)`) — if a third count variant is ever needed, consider factoring the query, not just the cache-fn skeleton.
