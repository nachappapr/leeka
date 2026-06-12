---
name: project-ap19-lifecycle-actions
description: AP-19 Epic 7 lifecycle actions — Unit 1 (mark-paid + cancel) approved/committed; Unit 2 (duplicate + delete) in progress
metadata:
  type: project
---

AP-19 (Epic 7 — Lifecycle & Payments) covers post-issue invoice lifecycle actions. Two units.

**Unit 1 — mark-paid + cancel: APPROVED + committed (commit c820795) on 2026-06-12.**
Cancel source-set deviation is RATIFIED by user approval: invoice is cancellable from sent/viewed/partial/overdue/pending; draft → "delete it instead" (rejected); paid and cancelled → rejected.

**Unit 2 — duplicate + delete: in progress (2026-06-12).**
Backend-only, routed to backend-engineer. Duplicate = fresh draft clone (copies line items, customer, GST flags; does NOT copy number/status/payments/paid_at/issued+viewed timestamps). Delete = drafts only.

**Why:** Epic 7 lifecycle story; mark-paid/cancel/duplicate/delete are the action surface on issued invoices.
**How to apply:** DB migration authorization GRANTED for AP-19 on main Supabase project (apply_migration + full verification evidence). Do NOT auto-advance to AP-20 after Unit 2 — stop for human review.
