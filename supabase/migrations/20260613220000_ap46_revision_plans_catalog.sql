-- AP-46 REVISION: plans catalog table.
--
-- CONTEXT
-- ───────
-- The prior AP-46 migration shipped subscriptions + billing_events (already applied).
-- This additive migration introduces the `plans` catalog table so the active
-- Razorpay plan_id is sourced from the DB rather than from env (RAZORPAY_PRO_PLAN_ID).
--
-- PRICE-CHANGE MODEL (append-only audit log)
-- ───────────────────────────────────────────
-- A price change is performed via two statements — never an UPDATE of an existing row:
--
--   1. INSERT a new row with the new razorpay_plan_id, is_active = true.
--   2. UPDATE the old row SET is_active = false, superseded_at = now().
--
-- This preserves full price history. The partial unique index (code WHERE is_active)
-- guarantees only one active row per code at any point in time. The history of
-- superseded rows is retained forever in the table; nothing is ever deleted.
--
-- BILLING AUTHORITY
-- ─────────────────
-- Razorpay's Plan (identified by razorpay_plan_id) is the billing authority for
-- the charged amount. The amount_inr column is our auditable display/catalog price
-- ONLY. No code must send amount_inr as a charge override to Razorpay; only
-- plan_id is sent in the createSubscription action.

-- ── 1. plans table ────────────────────────────────────────────────────────────

CREATE TABLE public.plans (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code             text        NOT NULL,
  razorpay_plan_id text        NULL,
  amount_inr       integer     NOT NULL,
  billing_period   text        NOT NULL DEFAULT 'monthly',
  is_active        boolean     NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  superseded_at    timestamptz NULL
);

-- Partial unique index: at most ONE active row per code.
-- This is also the index the active-plan lookup uses (Index Scan / Index Only Scan).
CREATE UNIQUE INDEX plans_active_code_uidx
  ON public.plans (code)
  WHERE is_active;

-- ── 2. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Authenticated users may SELECT active plans only.
-- No insert/update/delete policies for authenticated or anon — all writes are
-- performed exclusively by the service-role admin client (bypasses RLS).
CREATE POLICY "authenticated: read active" ON public.plans
  FOR SELECT TO authenticated
  USING (is_active);

-- Explicit restrictive anon deny (defence in depth — mirrors AP-46 table pattern).
CREATE POLICY "anon deny" ON public.plans
  AS RESTRICTIVE TO anon
  USING (false);

-- ── 3. Grants ─────────────────────────────────────────────────────────────────

GRANT SELECT ON public.plans TO authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.plans FROM authenticated;
REVOKE ALL ON public.plans FROM anon;

-- ── 4. Seed: one active 'pro' plan row ───────────────────────────────────────
--
-- razorpay_plan_id is intentionally NULL (placeholder).
-- NULL is unambiguous — it cannot be a real Razorpay plan id (those start with "plan_").
-- The createSubscription action treats NULL as "not yet configured" and returns
-- {ok:false, error:"Billing is not yet available."} — identical to the
-- unconfigured-env path. The user must run the UPDATE below once they create
-- the Razorpay Plan in the dashboard.
--
-- SETUP INSTRUCTION (replaces the old RAZORPAY_PRO_PLAN_ID env var):
--   UPDATE public.plans
--      SET razorpay_plan_id = 'plan_XXXXXXXXXXXX'   -- paste your real plan id here
--    WHERE code = 'pro' AND is_active;
--
INSERT INTO public.plans (code, razorpay_plan_id, amount_inr, billing_period, is_active)
VALUES ('pro', NULL, 99, 'monthly', true);
