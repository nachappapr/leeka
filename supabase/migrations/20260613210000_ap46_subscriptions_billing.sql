-- AP-46: Razorpay Pro subscription billing tables + plan-flip RPC.
--
-- DESIGN
-- ──────
-- Two new tables:
--   subscriptions   — one row per business; tracks the live Razorpay subscription.
--   billing_events  — append-only idempotency / audit ledger; one row per Razorpay
--                     webhook event that was successfully processed.
--
-- The single source of truth for "is this business Pro?" remains businesses.plan
-- (TEXT, default 'free') which AP-45 already reads via plan.server.ts.
-- AP-46 only WRITES businesses.plan as a derived side-effect of subscription events;
-- it never introduces a second read-path.
--
-- RLS DESIGN
-- ──────────
-- subscriptions: authenticated members of the business may SELECT their own row.
--   No INSERT/UPDATE/DELETE policies — those operations are exclusively performed
--   by the service-role admin client via the apply_subscription_event RPC
--   (SECURITY DEFINER, search_path locked) so service-role bypasses RLS by design.
-- billing_events: NO policies at all — service-role only (no tenant read, no anon).
--
-- RPC: apply_subscription_event
-- ──────────────────────────────
-- SECURITY DEFINER so the function can freely write subscriptions/billing_events
-- and update businesses.plan regardless of the caller's RLS context.  The webhook
-- route calls this via the admin (service-role) client, but SECURITY DEFINER makes
-- the intent explicit and prevents any accidental SECURITY INVOKER escalation.
--
-- Idempotency guard: if p_event_id already exists in billing_events the function
-- returns early with {already_processed:true} and makes NO writes.  This is the
-- standard "check-inside-the-transaction" pattern — checked and inserted in the
-- same implicit plpgsql transaction, making double-processing from concurrent
-- retries impossible.
--
-- p_target_plan constraint: enforced via IF/RAISE in the RPC body; the only
-- accepted values are 'free' and 'pro'.  The webhook route is the only caller
-- and it derives the value from the lifecycle map in TS (never from user input).

-- ── 1. subscriptions table ────────────────────────────────────────────────────

CREATE TABLE public.subscriptions (
  id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id                uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  razorpay_subscription_id   text        UNIQUE,
  razorpay_customer_id       text        NULL,
  status                     text        NOT NULL,
  current_period_end         timestamptz NULL,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

-- FK lookup index (business_id is also the UNIQUE key, so the unique index
-- covers FK lookups — explicit FK index not needed beyond that).
-- Additional index on razorpay_subscription_id for webhook lookups by sub id.
CREATE INDEX ap46_subscriptions_rzp_sub_id_idx
  ON public.subscriptions (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated members of the business may read their own subscription row.
CREATE POLICY "tenant: member read" ON public.subscriptions FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM public.business_members
       WHERE user_id = (SELECT auth.uid())
    )
  );

-- Explicit restrictive deny for anon (defence in depth).
CREATE POLICY "anon deny" ON public.subscriptions AS RESTRICTIVE TO anon USING (false);

-- Grants: SELECT only for authenticated (all writes go through service-role RPC).
GRANT SELECT ON public.subscriptions TO authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.subscriptions FROM authenticated;
REVOKE ALL ON public.subscriptions FROM anon;

-- ── 2. billing_events table ───────────────────────────────────────────────────

CREATE TABLE public.billing_events (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id  text        NOT NULL UNIQUE,
  event_type         text        NOT NULL,
  subscription_id    text        NULL,
  processed_at       timestamptz NOT NULL DEFAULT now()
);

-- Idempotency lookup index (the UNIQUE constraint creates this implicitly, but
-- naming it explicitly for clarity and EXPLAIN ANALYZE referencing).
-- The UNIQUE constraint on razorpay_event_id already creates a unique index
-- named billing_events_razorpay_event_id_key; the RPC idempotency lookup uses it.

-- RLS: enabled but NO policies — service-role only (RLS bypassed by service-role).
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- No policies → any non-service-role role that attempts access gets denied by
-- the locked-down RLS default.  Explicit anon deny for clarity.
CREATE POLICY "anon deny" ON public.billing_events AS RESTRICTIVE TO anon USING (false);
CREATE POLICY "authenticated deny" ON public.billing_events AS RESTRICTIVE TO authenticated USING (false);

-- Grants: authenticated gets NO access (all writes are service-role only).
REVOKE ALL ON public.billing_events FROM authenticated, anon;

-- ── 3. apply_subscription_event RPC ──────────────────────────────────────────
--
-- Params:
--   p_event_id             — Razorpay event id (idempotency key)
--   p_event_type           — e.g. 'subscription.activated'
--   p_subscription_id      — Razorpay subscription id
--   p_razorpay_customer_id — Razorpay customer id
--   p_business_id          — UUID of the business (from subscription notes)
--   p_status               — current subscription status from Razorpay
--   p_current_period_end   — current_end epoch from Razorpay (as timestamptz)
--   p_target_plan          — 'free' | 'pro' (lifecycle-mapped in TS)
--
-- Returns jsonb:
--   {already_processed:bool, plan_changed:bool, new_plan:text}

CREATE OR REPLACE FUNCTION public.apply_subscription_event(
  p_event_id             text,
  p_event_type           text,
  p_subscription_id      text,
  p_razorpay_customer_id text,
  p_business_id          uuid,
  p_status               text,
  p_current_period_end   timestamptz,
  p_target_plan          text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_plan  text;
  v_plan_changed  boolean;
BEGIN
  -- ── Validate p_target_plan before any writes ─────────────────────────────
  IF p_target_plan NOT IN ('free', 'pro') THEN
    RAISE EXCEPTION 'invalid p_target_plan: must be ''free'' or ''pro'', got ''%''', p_target_plan;
  END IF;

  -- ── Idempotency guard ─────────────────────────────────────────────────────
  -- Check-then-insert in the same transaction; concurrent retries with the
  -- same event_id will block on the unique index, then the second caller sees
  -- the row and returns already_processed:true without writing anything.
  IF EXISTS (
    SELECT 1 FROM billing_events WHERE razorpay_event_id = p_event_id
  ) THEN
    -- Return the current plan unchanged.
    SELECT plan INTO v_current_plan FROM businesses WHERE id = p_business_id;
    RETURN jsonb_build_object(
      'already_processed', true,
      'plan_changed',      false,
      'new_plan',          COALESCE(v_current_plan, 'free')
    );
  END IF;

  -- ── Read current plan ─────────────────────────────────────────────────────
  SELECT plan INTO v_current_plan FROM businesses WHERE id = p_business_id;
  v_plan_changed := (COALESCE(v_current_plan, 'free') IS DISTINCT FROM p_target_plan);

  -- ── Upsert subscriptions row (conflict on business_id UNIQUE) ─────────────
  INSERT INTO subscriptions (
    business_id,
    razorpay_subscription_id,
    razorpay_customer_id,
    status,
    current_period_end,
    updated_at
  )
  VALUES (
    p_business_id,
    p_subscription_id,
    p_razorpay_customer_id,
    p_status,
    p_current_period_end,
    now()
  )
  ON CONFLICT (business_id) DO UPDATE SET
    razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
    razorpay_customer_id     = EXCLUDED.razorpay_customer_id,
    status                   = EXCLUDED.status,
    current_period_end       = EXCLUDED.current_period_end,
    updated_at               = now();

  -- ── Flip businesses.plan ──────────────────────────────────────────────────
  -- businesses has no updated_at column (schema confirmed); only plan is written.
  UPDATE businesses
     SET plan = p_target_plan
   WHERE id = p_business_id;

  -- ── Record idempotency / audit ledger row ─────────────────────────────────
  INSERT INTO billing_events (razorpay_event_id, event_type, subscription_id)
  VALUES (p_event_id, p_event_type, p_subscription_id);

  RETURN jsonb_build_object(
    'already_processed', false,
    'plan_changed',      v_plan_changed,
    'new_plan',          p_target_plan
  );
END;
$$;

-- Grants: EXECUTE to service_role only (called exclusively from the webhook admin client).
REVOKE EXECUTE ON FUNCTION public.apply_subscription_event(
  text, text, text, text, uuid, text, timestamptz, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_subscription_event(
  text, text, text, text, uuid, text, timestamptz, text
) TO service_role;
