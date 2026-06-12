---
name: project-ap34-reports
description: AP-34 Reports (Epic 14) — both units done 2026-06-12 under standing approval; RPC contract, range presets, lazy recharts; uncommitted (main convo owns commit)
metadata:
  type: project
---

AP-34 Reports (Epic 14) completed 2026-06-12 in a parallel run alongside AP-33/AP-35 (standing approval for all units — no per-unit human gates).

- Unit 1 (backend): migration `supabase/migrations/20260612112000_ap34_reports_aggregation_rpc.sql` applied to main project. RPC `get_reports_metrics(p_business_id, p_from date, p_to date) returns jsonb` — `{months:[{month "YYYY-MM", revenue, received}...zero-filled], summary:{revenue, received, invoice_count, avg_invoice_value, avg_days_to_pay}}`, all paise. Revenue = issue-date basis excl draft/cancelled; received = cash basis (payments.paid_at); avg_days_to_pay = paid invoices only, cash-basis window (paid before range start don't count even if issued in-range — intentional). New index `payments_business_paid_at_idx (business_id, paid_at desc)`. Full MCP evidence on file (apply, EXPLAIN ANALYZE, advisors, GRANT, correctness vs raw SQL side-by-side).
- Unit 2 (frontend): `/reports` live — `src/app/(app)/reports/` + `src/components/reports/` (container, range chips as Link+aria-current, 4 metric cards, lazy chart, sr-only table, empty state). `recharts@3.8.1` added to package.json; lazy via next/dynamic ssr:false in `reports-chart-lazy.tsx` — recharts statically imported ONLY in `reports-chart.tsx`. Date ranges are PRESETS (3M/6M default-6M/12M/FY Apr–Mar) via `?range=`, computed in `src/lib/constants/reports.ts`; a free from/to picker was NOT built (PRD said "date-range selector"; presets accepted).
- a11y loop: 2 High fixed (aria-label on generic div → section; h1→h3 skip → h2), final PASS.

**Why:** Story closed without per-unit human review (explicit standing approval in the dispatch). Work is UNCOMMITTED — the main conversation owns the commit across the three parallel stories.
**How to apply:** Don't re-open AP-34 over the stale PRD checkbox. Follow-ups parked: custom from/to range picker; Indian k/L/Cr axis formatter; IST offset in FY boundary (uses UTC wall-clock); possible promotion of ReportsMetricCard to ui/custom; `payments_business_id_idx` partially superseded by the new composite index (future index cleanup); stale "Last generated" header comment in database.ts (shared with siblings). See [[supabase-mcp-no-branching]] for why evidence ran on main.
