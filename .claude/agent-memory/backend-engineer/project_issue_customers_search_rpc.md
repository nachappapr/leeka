---
name: issue-customers-search-rpc
description: list_customers_page gained server-side search (p_query) — escape pattern, overload-drop convention, function-scan EXPLAIN caveat
type: project
---

Unit 1 of 2 (backend/DB layer) for moving customers-list search server-side, 2026-07-08. Migration `supabase/migrations/20260708130000_list_customers_page_search.sql`, applied to the main project (no branch tooling available in this MCP session — same standing Option-B gap noted in [[project_issue30_customer_soft_delete]]).

**What changed:** `public.list_customers_page` gained a 5th param `p_query text default null`, appended last. Matches case-insensitively across `name`, `city`, `phone` only (deliberately excludes email/gstin — strict parity with the old client-side filter). SECURITY DEFINER / service_role-only EXECUTE trust model unchanged from [[project_ap42_list_pagination]].

**LIKE-escape pattern (reusable):** to make user search input always literal, escape backslash first, then `%`, then `_`, in that order — `replace(replace(replace(term, '\', '\\'), '%', '\%'), '_', '\_')` — then use `ilike '%' || escaped || '%' escape '\'`. Escaping backslash first is required so escaping the wildcards doesn't get re-escaped. Verified with adversarial inputs `'arav%Bhat'` and `'_havana'` (both correctly returned zero rows against data that would match if the wildcards leaked through).

**Overload-drop convention confirmed again:** `drop function if exists public.list_customers_page(uuid, text, uuid, int);` BEFORE `create or replace function ...(uuid, text, uuid, int, text)`. Same pattern as `create_business` (20260613250000). Do this any time a param is appended to an existing RPC signature — Postgres/PostgREST will otherwise keep both overloads and dispatch becomes ambiguous.

**EXPLAIN caveat:** calling a `language sql` function as a set-returning function (`select * from public.fn(...)`) always shows as an opaque `Function Scan` in EXPLAIN — Postgres does not inline/expose the function body's real plan that way. To actually prove index usage or scan type, EXPLAIN the *inner query body* directly (copy the SQL out of the function), not the wrapped RPC call.

**Performance context:** per-tenant customer counts observed in this project's seed data are in the tens-to-hundreds (one seeded business has 83). A seq scan filtered by `business_id` for a leading-wildcard `ILIKE '%term%'` is sub-millisecond at that scale and is expected — no trigram/GIN index was added for this unit (none was in the settled decisions). If a business's customer count grows into the thousands, revisit with a `pg_trgm` GIN index on `(name, city, phone)`, mirroring the pattern already used for the separate `search_customers` typeahead RPC in [[project_ap10_customers_crud]].
