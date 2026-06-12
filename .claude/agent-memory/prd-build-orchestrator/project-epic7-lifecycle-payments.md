---
name: project-epic7-lifecycle-payments
description: Epic 7 (Lifecycle & Payments) CLOSED 2026-06-12 — AP-17/18/19/20 all approved; AP-20 deviations (GET cron handler, IST day boundary) ratified
type: project
---

Epic 7 — Lifecycle & Payments is fully CLOSED as of 2026-06-12. All four stories approved and committed on main:

- AP-17 Issue invoice — satisfied by AP-16's `issue_invoice` RPC (see [[project-ap17-issue-invoice]]); PDF half deferred to AP-21.
- AP-18 Record payment — commit fd53fac. `record_payment` RPC + Server Action; locked fresh-SUM overpayment guard (strictly-over-total rejected, exact-to-total allowed).
- AP-19 Mark paid / duplicate / cancel / delete — commits c820795 (Unit 1: `mark_invoice_paid` + `cancel_invoice`) and 5da39b1 (Unit 2: duplicate fresh-draft clone + drafts-only delete).
- AP-20 Overdue sweep (cron) — commit 1a84fb5. `sweep_overdue_invoices` RPC + `/api/cron/overdue-sweep` route. **Ratified deviations:** GET handler alongside POST (Vercel Cron sends GET); day boundary = IST / Asia-Kolkata. Low reviewer nit (route logs `{ code, message }` not `{ code }`) accepted as-is — do not re-open.

**Why:** Milestone M1 lifecycle work; deviations were user-ratified at AP-20 approval, so they are decisions, not debt.

**How to apply:** Do not re-open any Epic 7 story. Next story in PRD order is Epic 8 / AP-21 — Branded multilingual PDF (P0 · L), which also owes AP-17 its deferred PDF leg. Notion Epic 7 page checkboxes all checked with commit annotations; root PRD has no epic-level status checklist to maintain.
