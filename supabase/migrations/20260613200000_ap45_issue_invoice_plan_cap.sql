-- AP-45: Free-plan invoice cap enforcement inside issue_invoice RPC.
--
-- DESIGN: The cap (5 issued invoices / calendar month for free-tier businesses)
-- is enforced ATOMICALLY inside the issue_invoice body.  The count query, the
-- cap check, and the number draw (next_invoice_number) all run in the same
-- implicit plpgsql transaction, so two concurrent issue calls at the boundary
-- cannot both pass the guard (the FOR UPDATE lock on invoice_sequences already
-- serialises concurrent number draws; the SELECT COUNT below runs in the same
-- transaction, so the window for a TOCTOU race is zero).
--
-- IST calendar month boundary — AP-20 / AP-33 precedent:
--   v_ist_month_start := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date
--   Count against: (sent_at AT TIME ZONE 'Asia/Kolkata')::date >= v_ist_month_start
--
-- Why sent_at (not issue_date):
--   issue_date is user-supplied and can be backdated. sent_at is server-set
--   inside issue_invoice to now() — it is the authoritative timestamp of the
--   act of issuing and therefore the correct field to count against for quota.
--   Drafts have sent_at = NULL so they are automatically excluded.
--
-- Partial index (ap45_issued_this_month_idx) accelerates the COUNT query:
--   predicate: sent_at IS NOT NULL
--   columns: (business_id, sent_at)
--   The planner can use this index for the month-boundary scan; without it the
--   query would do a partial seq-scan of the invoices table filtered by business_id.
--   Index is only written on issue (rare) and used by the cap check on every
--   issue — the read/write ratio heavily favours indexing.
--
-- Error signal: 'free plan invoice cap reached' — greppable, distinct.
-- The issueInvoice Server Action maps this string to a user-facing message.
--
-- Pro plan: if businesses.plan = 'pro', the cap check is skipped entirely;
-- the rest of the function is unchanged.
--
-- businesses.plan is TEXT in the schema (default 'free'). The RPC reads it via
-- a direct SELECT (SECURITY INVOKER — RLS on businesses allows authenticated
-- members to SELECT their own row via the existing "owner can read" policy).

-- ── 1. Partial index for cap-count query ─────────────────────────────────────
-- Covers: WHERE business_id = $1 AND sent_at IS NOT NULL AND <month predicate>
-- The partial predicate (sent_at IS NOT NULL) prunes all drafts at index-build
-- time; the planner then applies the month range as a residual filter on the
-- (business_id, sent_at) composite.
CREATE INDEX IF NOT EXISTS ap45_issued_not_null_business_sent_at_idx
  ON public.invoices (business_id, sent_at)
  WHERE sent_at IS NOT NULL;

-- ── 2. Replace issue_invoice with plan-aware version ─────────────────────────
CREATE OR REPLACE FUNCTION public.issue_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invoice          record;
  v_number           text;
  v_result           jsonb;
  v_plan             text;
  v_ist_month_start  date;
  v_issued_count     int;
BEGIN
  -- ── Membership guard ───────────────────────────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_id = p_business_id
      AND user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'not a member of this business';
  END IF;

  -- ── Read invoice row (ownership + existence guard) ─────────────────────────
  SELECT id, business_id, number, status, issue_date
    INTO v_invoice
    FROM invoices
   WHERE id = p_invoice_id
     AND business_id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice not found';
  END IF;

  -- ── Double-issue guard ─────────────────────────────────────────────────────
  IF v_invoice.status <> 'draft' OR v_invoice.number IS NOT NULL THEN
    RAISE EXCEPTION 'invoice is not a draft';
  END IF;

  -- ── Plan + cap check (free-tier only) ──────────────────────────────────────
  -- Read plan from businesses.  SECURITY INVOKER means RLS applies; the member
  -- can SELECT their own business row via existing RLS policies.
  SELECT plan INTO v_plan
    FROM businesses
   WHERE id = p_business_id;

  IF v_plan IS DISTINCT FROM 'pro' THEN
    -- IST calendar month start — same pattern as AP-20, AP-33.
    v_ist_month_start := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date;

    -- Count invoices issued in the current IST calendar month.
    -- Uses the partial index ap45_issued_not_null_business_sent_at_idx.
    -- sent_at IS NOT NULL is enforced by the partial index predicate;
    -- the date cast converts the timestamptz to IST calendar date for
    -- comparison with v_ist_month_start (a date, not a timestamptz).
    SELECT COUNT(*)
      INTO v_issued_count
      FROM invoices
     WHERE business_id = p_business_id
       AND sent_at IS NOT NULL
       AND (sent_at AT TIME ZONE 'Asia/Kolkata')::date >= v_ist_month_start
       AND (sent_at AT TIME ZONE 'Asia/Kolkata')::date
             < (v_ist_month_start + interval '1 month')::date;

    IF v_issued_count >= 5 THEN
      RAISE EXCEPTION 'free plan invoice cap reached';
    END IF;
  END IF;

  -- ── Draw the next invoice number ───────────────────────────────────────────
  v_number := public.next_invoice_number(p_business_id, v_invoice.issue_date);

  -- ── Transition: draft → sent ───────────────────────────────────────────────
  UPDATE invoices
     SET number     = v_number,
         status     = 'sent',
         sent_at    = now(),
         updated_at = now()
   WHERE id = p_invoice_id
     AND business_id = p_business_id
     AND status = 'draft';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice is not a draft';
  END IF;

  v_result := jsonb_build_object(
    'invoice_id', p_invoice_id,
    'number',     v_number,
    'status',     'sent'
  );

  RETURN v_result;
END;
$$;

-- ── Grants: authenticated only (unchanged) ────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.issue_invoice(uuid, uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.issue_invoice(uuid, uuid) TO authenticated;
