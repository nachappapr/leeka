---
name: ap34-reports-aggregation
description: AP-34 get_reports_metrics RPC — monthly revenue/received chart + summary aggregates; payments composite index
type: project
---

Migration: `supabase/migrations/20260612112000_ap34_reports_aggregation_rpc.sql`
Applied: 2026-06-12

**RPC:** `public.get_reports_metrics(p_business_id uuid, p_from date, p_to date) RETURNS jsonb`
- STABLE SECURITY DEFINER, `SET search_path TO 'public', 'pg_temp'`
- Membership guard: `not exists (select 1 from business_members where business_id=p_business_id and user_id=(select auth.uid()))`
- Range validation: `p_from > p_to` raises exception
- GRANT authenticated / REVOKE PUBLIC+anon (standard pattern)

**Index added:** `payments_business_paid_at_idx ON public.payments (business_id, paid_at DESC)` — the prior single-column `payments_business_id_idx` (from AP-8) did not support ordered paid_at range scans. Bitmap Index Scan confirmed in EXPLAIN ANALYZE.

**Invoices leg:** Seq scan at 11 rows (expected; planner correctly chooses seq scan below ~100 rows). Index `invoices_business_id_status_issue_date_idx` will be used at production row counts.

**jsonb shape:**
- `months`: array of `{month: "YYYY-MM", revenue: int, received: int}`, zero-filled via `generate_series` for all calendar months in range — Mar 2026 appeared as `{revenue:0, received:0}` even with no qualifying rows.
- `summary`: `{revenue, received, invoice_count, avg_invoice_value, avg_days_to_pay}` — `avg_days_to_pay` is null when no paid invoices in range.

**avg_days_to_pay:** `round(avg(extract(epoch from (paid_at - issue_date::timestamptz)) / 86400.0)::numeric, 1)` — epoch arithmetic needed because paid_at is timestamptz and issue_date is date.

**Correctness verified** against seeded test data (5 invoices, 2 payments); raw aggregates matched RPC CTE logic exactly. Test data cleaned up post-verification (0 test rows remaining).

**Why:** revenue vs received are intentionally independent — revenue tracks billed amounts by issue_date; received tracks cash received by paid_at date.
