---
name: project-ap42-list-pagination
description: AP-42 Unit 1 settled decisions — keyset indexes + list RPCs for invoices and customers
metadata:
  type: project
---

## Settled decisions from AP-42 Unit 1 (completed 2026-06-13)

**Indexes added:**
- `invoices_list_unfiltered_idx` on `invoices(business_id, issue_date DESC, id DESC)` — unfiltered list page path
- `invoices_list_status_idx` on `invoices(business_id, status, issue_date DESC, id DESC)` — status-filtered path
- `customers_list_keyset_idx` on `customers(business_id, name, id)` — customer keyset list

**Indexes dropped (covered by new):**
- `invoices_business_id_status_issue_date_idx` — 3-col prefix fully covered by `invoices_list_status_idx`
- `customers_business_name_idx` — 2-col prefix fully covered by `customers_list_keyset_idx`

**Three RPCs added (all LANGUAGE sql, STABLE, SECURITY INVOKER, set search_path = ''):**
- `list_invoices_page(p_business_id, p_status, p_cursor_issue_date, p_cursor_id, p_limit)` → table of (id, number, customer_name, customer_city, issue_date, total, status). Keyset: `(issue_date, id) < (cursor_date, cursor_id)`. Status filter via `p_status is null or i.status = p_status`. Limit capped `least(greatest(p_limit,1),100)`.
- `invoice_status_counts()` → table of (status, count). No p_business_id — resolves business via business_members for caller, matching dashboard_summary pattern.
- `list_customers_page(p_business_id, p_cursor_name, p_cursor_id, p_limit)` → table of (id, name, phone, email, gstin, billing_address, city, created_at). Keyset: `(name, id) > (cursor_name, cursor_id)`.

**Cursor semantics:**
- Invoice cursor: `(issue_date, id) < (p_cursor_issue_date, p_cursor_id)` — row-value comparison, Postgres pushes this into the index as `Index Cond`
- Customer cursor: `(name, id) > (p_cursor_name, p_cursor_id)` — row-value comparison on text+uuid
- Both: cursor only applied when BOTH cursor args are non-null

**Performance at 10k invoices / 2k customers per tenant (EXPLAIN ANALYZE evidence):**
- Shape A (first page, no filter): 0.676 ms, `Index Scan using invoices_list_unfiltered_idx`
- Shape B (cursor page, no filter): 0.697 ms, `Index Scan using invoices_list_unfiltered_idx` with ROW cursor pushdown
- Shape C (cursor page, status='sent', 1,250 rows): 0.458 ms, `Index Scan using invoices_list_status_idx`
- Shape D (customer cursor page): 0.255 ms, `Index Scan using customers_list_keyset_idx`
- All < 1 ms actual execution time, well under 50 ms AC

**Grant pattern:** REVOKE from public, anon; GRANT to authenticated — same as AP-41.

**Migration file:** `supabase/migrations/20260612203938_ap42_list_pagination.sql`

**Why:** `invoice_status_counts()` takes no p_business_id because the dashboard resolves tenancy from business_members — same pattern as `dashboard_summary` and `get_reports_metrics`. Consistent with v1 single-business-per-user assumption.

**How to apply:** Future list RPCs for new resource types: use LANGUAGE sql (not plpgsql) when no procedural logic is needed; keyset on (sort_col, id) row-value comparison is index-friendly and eliminates full Sort nodes.
