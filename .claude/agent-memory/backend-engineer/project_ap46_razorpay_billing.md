---
name: ap46-razorpay-billing
description: AP-46 Razorpay Pro subscription billing — schema, plan-flip RPC, webhook route, create-subscription SA, env wiring
metadata:
  type: project
---

AP-46 shipped 2026-06-13. Epic 18 — Plan & Billing, backend half.

**Schema: two new tables**
- `subscriptions`: id uuid pk, business_id uuid UNIQUE NOT NULL FK businesses(id), razorpay_subscription_id text UNIQUE, razorpay_customer_id text NULL, status text NOT NULL, current_period_end timestamptz NULL, created_at/updated_at.  
- `billing_events`: id uuid pk, razorpay_event_id text NOT NULL UNIQUE (idempotency key + audit), event_type text NOT NULL, subscription_id text NULL, processed_at timestamptz NOT NULL DEFAULT now().

**businesses schema finding:** `businesses` table has NO `updated_at` column (only `created_at`). The initial RPC attempted `SET updated_at = now()` on businesses and failed. Fixed in the RPC to only `SET plan = p_target_plan`. Remember this for any future migration touching businesses.

**RLS:**
- subscriptions: RLS enabled. SELECT policy for authenticated members (via business_members). NO insert/update/delete policies for any non-service-role. Explicit restrictive anon deny. GRANT SELECT only to authenticated; REVOKE INSERT/UPDATE/DELETE from authenticated; REVOKE ALL from anon.
- billing_events: RLS enabled. NO permissive policies for any role. Restrictive deny for anon AND authenticated. REVOKE ALL from authenticated/anon. Service-role bypasses RLS.

**RPC: apply_subscription_event** (SECURITY DEFINER, search_path = public, pg_temp)
- Params: p_event_id, p_event_type, p_subscription_id, p_razorpay_customer_id, p_business_id uuid, p_status, p_current_period_end timestamptz, p_target_plan.
- GRANT EXECUTE to service_role only. REVOKE from PUBLIC, anon, authenticated.
- Returns jsonb: {already_processed:bool, plan_changed:bool, new_plan:text}.
- Idempotency: checks billing_events in same transaction before any writes.
- Lifecycle: webhook route (TS) maps event types to plan; RPC validates p_target_plan IN ('free','pro').

**Env vars (all optional, fail-closed):** RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET. isRazorpayConfigured() = all three present. None are NEXT_PUBLIC_. RAZORPAY_PRO_PLAN_ID was REMOVED in the AP-46 revision — plan_id now comes from the DB plans table.

**Webhook route:** `src/app/api/razorpay/webhook/route.ts`. POST only. Razorpay signature = bare hex HMAC-SHA256 of raw body (NO "sha256=" prefix, unlike Meta). Header: `x-razorpay-signature`. Lifecycle map in TS: activated/charged→'pro'; cancelled/halted/completed→'free'. Unknown events: log + 200.

**Server Action:** `src/app/(app)/settings/billing-actions.ts` — `createSubscription()`. Returns {ok:true, subscriptionId, razorpayKeyId} on success. KEY_ID returned (publishable key) but never KEY_SECRET or WEBHOOK_SECRET.

**Type cast pattern:** `p_current_period_end` is timestamptz (nullable in SQL) but generated as `string` (non-nullable) in database.ts. Used `as unknown as RpcArgs` cast on the whole args object (AP-16 precedent) with an explaining comment — no eslint-disable, no `any`.

**EXPLAIN ANALYZE:** `Index Only Scan using billing_events_razorpay_event_id_key on billing_events` — 1.123 ms.
**Idempotency proven:** Call 1 → {already_processed:false, plan_changed:true, new_plan:"pro"}; Call 2 → {already_processed:true, plan_changed:false, new_plan:"pro"}.
**get_advisors:** No new Critical/High. All WARNs pre-existing (AP-9, AP-6, AP-34).

**Why:** businesses.plan remains the single read-source for isPro() (AP-45). AP-46 only writes it as a side-effect of subscription lifecycle events — no second read-path introduced.

**AP-46 REVISION (2026-06-13): plans catalog table**
- New `plans` table: id uuid PK, code, razorpay_plan_id (NULL = placeholder), amount_inr, billing_period, is_active, created_at, superseded_at.
- Partial unique index plans_active_code_uidx (code WHERE is_active) — active-plan lookup uses Index Scan, 0.1ms.
- RLS: authenticated SELECT is_active only. Anon RESTRICTIVE deny. GRANT SELECT to authenticated; REVOKE write from authenticated; REVOKE ALL from anon.
- Seeded: code='pro', razorpay_plan_id=NULL (placeholder), amount_inr=99, billing_period='monthly', is_active=true.
- Price-change model: INSERT new row (is_active=true) + UPDATE old row (is_active=false, superseded_at=now()). Append-only. No overwrites.
- createSubscription now reads planId from DB via getActiveProPlanId() helper; null → {ok:false, error:"Billing is not yet available."}.
- isRazorpayConfigured() now checks only KEY_ID + KEY_SECRET + WEBHOOK_SECRET (synchronous env guard). DB check is layered separately inside createSubscription.
- SETUP: to go live, run: UPDATE public.plans SET razorpay_plan_id = 'plan_XXXX' WHERE code = 'pro' AND is_active;
- Migrations: 20260613220000_ap46_revision_plans_catalog.sql + 20260613221000_ap46_revision_plans_add_pk.sql (PK addendum applied separately via MCP).

**FOLLOW-UPS (parked, not built):**
- current_period_end backstop sweep cron (v1 intentionally omitted).
- Frontend checkout UI (separate pass, plan-section.tsx price read from DB).
- Refunds/proration/plan-downgrade-mid-cycle handling.
