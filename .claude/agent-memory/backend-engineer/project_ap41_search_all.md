---
name: ap41-search-all-rpc
description: AP-41 search_all RPC — unified invoice+customer search, GIN indexes, data layer, Server Action
type: project
---

## Settled decisions

- **`customers_name_trgm_idx` already existed** from AP-10; migration uses `IF NOT EXISTS` as safety; do not add it again.
- **New GIN index**: `invoices_number_trgm_idx` on `invoices(number)` using `extensions.gin_trgm_ops`.
- **New btree index**: `invoices_business_id_total_idx` on `invoices(business_id, total)` for paise-range amount searches.
- **RPC `search_all`**: `SECURITY INVOKER`, returns `setof jsonb`. Shape per row: `{ kind, ...fields }`. Invoices: `{ kind:"invoice", id, number, customer_name, issue_date, total, status }`. Customers: `{ kind:"customer", id, name, phone }`.
- **Empty query behavior**: returns recent invoices (`issue_date desc`) + recent customers (`created_at desc`), up to `p_limit` each — feeds palette idle state live. No separate "recent" endpoint needed.
- **Amount parsing** (non-trivial): strips commas/whitespace, checks `^[0-9]+(\.[0-9]{1,2})?$`. Without decimal → rupee band (`rupees*100` to `rupees*100+99` paise). With decimal → exact paise range (`floor*100` to `ceil*100`). `v_is_amount` flag guards OR branch.
- **`search_all` GRANT**: `authenticated` only; `anon` and `public` are REVOKEd.
- **Customer outstanding figure**: omitted — per-customer outstanding aggregation risks >300ms budget at scale; parked as FOLLOW-UP.
- **Data layer**: `src/lib/data/search.ts` — `"server-only"`, `resolveBusinessId` pattern (mirrors dashboard.ts), `isJsonObject` narrowing (never `any`), `parseInvoiceHit` / `parseCustomerHit` with `Json` type.
- **Server Action**: `src/app/(app)/search/actions.ts` — `"use server"`, `searchAction(query: string)`, trims + guards (empty → EMPTY, length >200 → EMPTY), calls `searchAll`.
- **Types**: `src/lib/types/search.ts` extended with `SearchInvoiceHit`, `SearchCustomerHit`, `SearchResults`, `EMPTY_SEARCH_RESULTS`; `RecentSearchEntry` + `SearchScope` kept intact.
- **database.ts regenerated**: includes `search_all: { Args: { p_business_id: string; p_limit?: number; p_query: string }; Returns: Json[] }`.

**Why:** Unified search palette needs a single RPC call for both invoice and customer results with proper RLS; no service-role path.

**How to apply:** Future search features should extend `search_all` or add a new scoped RPC rather than adding inline queries to the data layer.
