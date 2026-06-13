---
name: ap46-razorpay-billing
description: AP-46 Razorpay Pro subscription — CLOSED (build); commit c02bcab; env-gated/INERT; pricing sourced from DB plans table; live go-live blocked on Razorpay provisioning
metadata:
  type: project
---

AP-46 (Epic 18 — Plan & Billing, last unit) APPROVED & committed 2026-06-13. Commit `c02bcab` on main (local, ahead of origin — not pushed). All 3 Notion checkboxes ticked; deviation/setup comment posted (id `37eaaac9-a552-815f-a103-001dc84ac6b2`). Migrations already applied to dev DB before commit (code-only commit).

**Status: env-gated / INERT.** `createSubscription` returns "Billing is not yet available." while the active `plans.razorpay_plan_id` is NULL. No live charge possible until go-live. Analogous to Epics 10/11 env-gated state.

**Pricing sourced from DB, not env:** new `public.plans` catalog table replaces `RAZORPAY_PRO_PLAN_ID` env. Append-only price-history (insert new active row + supersede old; never UPDATE the id). Partial unique index `plans_active_code_uidx (code) WHERE is_active` = one active row per code. `amount_inr` is display/catalog only — Razorpay Plan is the billing authority; only plan_id is sent on createSubscription.

**Migrations (all applied to dev DB):**
- `20260613210000` subscriptions + billing_events (RLS, service-role-only writes)
- `20260613220000` plans catalog (RLS: authenticated read active only; anon deny; service-role writes)
- `20260613221000` plans surrogate uuid PK addendum (clears no_primary_key advisor)
- `20260613222000` plans CHECK `(razorpay_plan_id IS NULL OR razorpay_plan_id LIKE 'plan_%')` — MCP-verified (malformed rejected via check_violation; NULL + plan_ accepted; advisors clean of plans findings)

**Approved deviations:** publishable key returned via action result (not NEXT_PUBLIC_); coral-contrast Highs → standing coral a11y backlog; PK addendum + CHECK migrations.

**One-time GO-LIVE SQL** (after creating the Razorpay Plan in the dashboard):
`UPDATE public.plans SET razorpay_plan_id = 'plan_XXXX' WHERE code = 'pro' AND is_active;`

**Why:** v1 monetisation needs paid upgrade path; build is done but Razorpay account/Plan/live-keys/webhook-secret are user-owned and not yet provisioned.
**How to apply:** Epic 18 is build-complete. Do NOT re-open AP-46 over the inert status — it is intentional. Story-completion gate (real-device, Lighthouse, AC verification) is blocked on Razorpay provisioning; surface, do not self-certify. Do NOT touch home.ts marketing copy (user owns it; already fixed in b0b3737).
