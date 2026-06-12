---
name: project-ap33-dashboard-summary
description: AP-33 Dashboard summary (Epic 14) — both units shipped 2026-06-12 under standing approval; RPC contract, parallel-run constraints, uncommitted state, parked follow-ups
metadata:
  type: project
---

AP-33 (Epic 14 "Dashboard summary") CLOSED 2026-06-12, built under standing all-units approval in a parallel run with sibling orchestrators (AP-34 reports, AP-35 export) in the same tree + same Supabase project. NOT committed — main conversation owns the commit; tree contains AP-33 changes mixed with sibling dirt.

- Unit 1 (backend): `public.dashboard_summary(p_business_id uuid) returns jsonb` — keys: outstanding_amount/count (GREATEST(total-amount_paid,0) over sent/viewed/partial/pending/overdue), overdue_amount/count, paid_this_month (payments.amount, current Asia/Kolkata month, bounded both ends), status_counts (all 8 enum keys zero-filled, hardcoded literal — must be updated in any migration adding an enum value). SECURITY INVOKER + business_members guard; EXECUTE: authenticated only. Migration file `supabase/migrations/20260612110000_ap33_dashboard_summary_rpc.sql`; applied to main project (history entry version 20260612143551). Post-review hardening (GREATEST + month upper bound) was synced to the live function via execute_sql CREATE OR REPLACE, not a second apply_migration — file == live function.
- Unit 2 (frontend): `src/lib/data/dashboard.ts` (getDashboardSummary — one RPC round-trip, runtime-narrowed, zero-filled fallback; getRecentInvoices — cancelled excluded via .neq), `src/lib/types/dashboard.ts`; dashboard-container async RSC with Promise.all; hero-grid prop-driven (dl/dt/dd structure); sheets in src/components/invoices/** untouched — real data flows via InvoiceListActionsProvider. a11y fix: empty-dashboard-hero h1→h2.
- Parked follow-ups: shared resolveBusinessId util (dashboard.ts + reports.ts duplicate it); "↗12% vs last month" trend still static copy; invoice-detail-container still resolves mock INVOICE_DETAILS (uuid links from dashboard-columns are ready); activity/aging cards still mock; invoices.customer_id unindexed FK (pre-existing advisor INFO); optional use cache/cacheTag("dashboard") once caching strategy is decided.

**Why:** Epic 14 ran as three concurrent sibling stories; commit/story-gate state is unusual (uncommitted, interleaved tree) and the RPC contract + drift notes aren't fully derivable from the repo until committed.
**How to apply:** Don't re-open AP-33 over a stale PRD checkbox. When wiring the invoices list/detail pages, reuse the dashboard.ts mapping precedent and pick up the parked follow-ups. Story-completion DoD (real-device test, prod-build console, Lighthouse ≥85) was surfaced, not self-certified.
