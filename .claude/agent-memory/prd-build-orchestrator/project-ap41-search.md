---
name: project-ap41-search
description: Epic 16 / AP-41 search — state, plan, the mock-detail navigation boundary, trigram readiness
metadata:
  type: project
---

Epic 16 (AP-41 — Search invoices + customers) started 2026-06-13. Single P1·M story, one H3 unit, treated as a MIXED unit split backend-first then frontend.

**Why:** The search UI already exists fully built (`search-palette.tsx` desktop ⌘K, `mobile-search-sheet.tsx` + `mobile-search-trigger.tsx`) but both read MOCK constants (`INVOICES`, `CUSTOMERS`). AP-41 = wire them to a real, trigram/index-backed, debounced API shared by both surfaces. AC: relevant results < 300 ms.

**How to apply:**
- DB readiness verified 2026-06-13: `pg_trgm` already installed (extensions schema). Columns confirmed: `customers(name, phone, city, ...)`, `invoices(number, total[paise int], customer_id, status, issue_date)`. No trigram indexes yet.
- Sub-unit A (backend-engineer): GIN trigram indexes on customers.name + invoices.number; a `search_all(p_business_id, p_query, p_limit)` security-invoker RPC (RLS-scoped) returning unified invoice+customer hits incl. amount match on invoices.total; typed data-read layer in `src/lib/data/search.ts` + `src/lib/types/search.ts` extension. Option-B migration auth stands.
- Sub-unit B (frontend-engineer): rewire BOTH palettes to call the API (debounced, shared). Existing a11y scaffolding (combobox/listbox, live regions, focus trap, radiogroup scope chips) must be PRESERVED.
- BOUNDARY / follow-up: invoice DETAIL page is still mock-backed — `invoice-detail-container.tsx` uses `findInvoiceDetail` from `src/lib/constants/invoices.ts`, keyed by display id (number w/o `#`). Search results navigate to `/invoices/${id}` and `/customers` (list, also mock). AP-41 does NOT fix detail/list wiring — keep nav targets, flag as follow-up. Same placeholder pattern noted in Epic 10/11.
- `formatPaise` in src/lib/utils/format-currency.ts; `initials` in format-name.ts; recents persistence in src/lib/utils/search-recents.ts (localStorage) — reuse, do not reimplement.
