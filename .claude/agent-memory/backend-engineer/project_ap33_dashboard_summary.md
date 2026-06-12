---
name: ap33-dashboard-summary
description: AP-33 Unit 1 — dashboard_summary RPC: single-round-trip aggregate for dashboard hero metrics
metadata:
  type: project
---

AP-33 Unit 1 shipped: `public.dashboard_summary(p_business_id uuid)` → `jsonb`. Migration: `20260612110000_ap33_dashboard_summary_rpc.sql`. Applied to main dev project 2026-06-12.

**Returned jsonb shape (all keys snake_case, always present):**
```
{
  outstanding_amount: bigint,  -- paise, SUM(total - amount_paid) for sent/viewed/partial/pending/overdue
  outstanding_count:  int,
  overdue_amount:     bigint,  -- paise, subset restricted to status='overdue'
  overdue_count:      int,
  paid_this_month:    bigint,  -- paise, SUM(payments.amount) where IST calendar month matches
  status_counts: {             -- all 8 invoice_status enum keys, zero-filled
    draft, sent, viewed, partial, pending, paid, overdue, cancelled
  }
}
```

**Security model:** SECURITY INVOKER + membership guard (same as next_invoice_number, record_payment). GRANT EXECUTE to authenticated; REVOKE from PUBLIC, anon.

**Single round-trip design:** invoices aggregation done in one SELECT with CASE WHEN blocks (outstanding + overdue in one pass). payments aggregation is a second SELECT (separate table). status_counts uses jsonb seed object `||` COALESCE(jsonb_object_agg(...), '{}'::jsonb) for zero-filling.

**IST month boundary (AP-20 precedent):**
- `v_ist_month_start := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date`
- payments filter: `(paid_at AT TIME ZONE 'Asia/Kolkata')::date >= v_ist_month_start`

**Index situation:**
- invoices: seq scan with 11 rows (correct planner choice); `invoices_business_id_status_issue_date_idx` covers at production scale. No new index needed.
- payments: `payments_business_paid_at_idx` on (business_id, paid_at) already existed (added by AP-34 sibling migration). Bitmap Index Scan confirmed in EXPLAIN ANALYZE. No new index needed.

**Zero-fill proof:** COALESCE(SUM(...), 0) returns 0 for empty table. status_counts seed object ensures all 8 keys always present even with zero invoices.

**TypeScript:** `dashboard_summary: { Args: { p_business_id: string }; Returns: Json }` in `src/lib/types/database.ts`. Caller casts via `as unknown as DashboardSummaryRow` pattern (same as other Json-returning RPCs).

**STABLE marker:** function declared STABLE (reads only, no side effects) — allows the planner to optimize multiple calls within a transaction.

**Parallel-run note:** AP-34 sibling migration added `payments_business_paid_at_idx` before AP-33 applied. The EXPLAIN ANALYZE showed Bitmap Index Scan on that index for the paid_this_month query.

**get_advisors:** zero new findings. Pre-existing WARNs: get_public_invoice (intentional SECURITY DEFINER AP-9), create_business (intentional AP-6), get_reports_metrics (AP-34 sibling, intentional SECURITY DEFINER), auth_leaked_password_protection (phone OTP project).

**Why:** dashboard_summary is a read-only aggregate — STABLE + SECURITY INVOKER is the correct posture. The membership guard is the explicit tenant-isolation layer; RLS on the underlying tables is the defence-in-depth layer.

**How to apply:** future aggregate RPCs that read multiple tables should follow this pattern: one SELECT per table (not a JOIN), COALESCE every aggregate, use the IST date pattern for any month/year boundary, declare STABLE.
