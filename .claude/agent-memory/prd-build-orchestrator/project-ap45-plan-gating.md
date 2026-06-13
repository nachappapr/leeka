---
name: ap45-plan-gating
description: AP-45 free vs Pro gating — CLOSED; commit ad2e5d3; two deviations ratified; Epic 18 AP-46 (Razorpay) still open
metadata:
  type: project
---

AP-45 (Epic 18 — Plan & Billing) APPROVED & shipped 2026-06-13. Commit `ad2e5d3` on main (local, ahead of origin). All 4 Notion checkboxes ticked + deviation comment posted (comment id 37eaaac9-a552-8127-ac3a-001d257ca154). Migration `20260613200000` already applied to main DB before commit (code-only commit).

**Two user-approved deviations:**
1. issueInvoice (AP-16 issue_invoice RPC) wired to the UI for the first time — desktop InvoiceActionsDraft + mobile InvoiceDetailMobileFooter; button relabelled "Issue invoice".
2. Free invoice cap counts against `sent_at` (server-set at issue) not user-supplied `issue_date` (anti-backdating).

**Spec (PRD §16 OQ#2, resolved 2026-06-13):** hybrid monetisation. Free = 5 issued/calendar-month (IST), issued-only (drafts free); Pro ₹99/mo unlocks unlimited + GST export + reports + auto reminders. Server is source of truth via `src/lib/plan/plan.server.ts` (`isPro`/`getPlan`, fail-closed to free).

**Parked follow-up:** `home.ts PRICING_PLANS` says "Up to 10 invoices/month" but enforced cap is 5 — copy fix.
**Why:** user is handling the home.ts copy follow-up SEPARATELY — do NOT touch it.
**How to apply:** Epic 18 is NOT closed — AP-46 (Razorpay subscription/payment for Pro, P2·L) remains open. plan='pro' is set manually until AP-46 ships the webhook.
