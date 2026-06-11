---
name: project-ap10-customers-crud
description: AP-10 Unit 1 settled decisions — customer search indexes, GSTIN constraint, upsert_customer/search_customers RPCs
metadata:
  type: project
---

## Settled decisions from AP-10 Unit 1 (completed 2026-06-11)

**Migration:** `20260611230002_ap10_customers_search_and_rpcs.sql`

**Objects added:**
- `customers_name_trgm_idx` — GIN index using `extensions.gin_trgm_ops` (pg_trgm in extensions schema)
- `customers_business_name_idx` — btree composite (business_id, name)
- `customers_gstin_format` — CHECK constraint, NULL allowed, validates `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
- `upsert_customer` RPC — SECURITY INVOKER, search_path = public, pg_temp
- `search_customers` RPC — SECURITY INVOKER, search_path = public, pg_temp

**Parameter order deviation (upsert_customer):**
- Spec listed `p_customer_id uuid default null` before `p_name text` (no default)
- Postgres requires non-defaulted params to precede defaulted params
- Fix: moved `p_name` before `p_customer_id` in the signature
- All callers (JS client) should use named params to avoid ambiguity

**search_customers uses ilike, not pure trigram similarity:**
- Spec says `name ilike '%' || p_query || '%'` — transcribed verbatim
- The GIN trgm index is available for future trigram similarity queries
- ilike on a GIN trgm index: Postgres may use the index for `%word%` patterns

**Membership guard pattern (same as invoices RPCs):**
```sql
if not exists (
  select 1 from business_members
  where business_id = p_business_id
    and user_id = (select auth.uid())
) then
  raise exception 'not a member of this business';
end if;
```

**Grants:**
- Both RPCs: `revoke execute from public, anon` + `grant execute to authenticated`
- No `anon` grant — these are internal app RPCs, not public-facing

**get_advisors findings (this unit):**
- No new WARNs or CRITs — clean
- Unused index INFOs for new indexes: expected on dev DB with no traffic

**Why:** p_name ordering is a Postgres rule, not a design choice — surface to frontend callers
so they use named parameter syntax when calling via supabase-js (.rpc('upsert_customer', { p_business_id, p_name, ... })).

**How to apply:** Future RPCs with a mix of required + optional params: order required params first.
Named-param calling convention in supabase-js avoids the issue at the call site.
