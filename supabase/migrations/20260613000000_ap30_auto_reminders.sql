-- AP-30: claim_due_reminders RPC + de-dupe index + reminder candidate index
--
-- Purpose: Daily cron sweep — for every Pro business with reminders enabled,
--   claim auto-reminder events for invoices whose due_date matches a configured
--   offset (N days after due_date in IST). The claim is atomic and idempotent:
--   ON CONFLICT DO NOTHING against the unique expression index ensures a
--   re-run on the same IST day produces zero new rows for the same
--   (invoice, offset) pair.
--
-- IST semantics: v_ist_today := (now() AT TIME ZONE 'Asia/Kolkata')::date
--   offset 0 = "on the due date itself"  →  v_ist_today = i.due_date
--   offset N = "N days after due_date"   →  (v_ist_today - i.due_date) = N
--   Negative differences (future due dates) never match a non-negative offset.
--
-- Cron schedule: 45 19 * * * UTC = 01:15 IST — runs after the 01:00 IST
--   overdue sweep (30 19 * * *) so freshly-overdue invoices are already
--   classified as 'overdue' before this RPC evaluates them.
--
-- De-dupe guarantee: the UNIQUE expression index on invoice_events covering
--   (invoice_id, (meta->>'offset_days')::int) WHERE type = 'reminder_sent'
--   AND meta ? 'offset_days' is the hard DB-level idempotency lock.
--   ON CONFLICT DO NOTHING discards a second claim attempt for the same
--   (invoice, offset) silently — no error, no duplicate row. Manual reminder
--   events (no offset_days key in meta) are excluded by the partial WHERE
--   clause and are unaffected.
--
-- Security design: SECURITY INVOKER.
--   This RPC is GRANT-ed only to service_role. The service-role client bypasses
--   RLS entirely regardless of INVOKER vs DEFINER, so INVOKER is the safer
--   default — it does not inadvertently elevate a future misconfigured caller.
--   REVOKE from PUBLIC, anon, authenticated so only the server-side cron path
--   (via the admin client) can execute it.
--
-- No membership guard: background sweep, no auth.uid() context. Access
--   control is enforced solely by the GRANT/REVOKE block below (service_role
--   only). Do not add an auth.uid() guard.
--
-- Idempotency: ON CONFLICT DO NOTHING on the unique index means a second call
--   on the same IST calendar day returns claimed_count = 0 for all already-
--   claimed (invoice, offset) pairs.
--
-- Returns: jsonb {
--   claimed_count: int,
--   reminders: [{
--     event_id, invoice_id, business_id, invoice_number, public_token,
--     customer_phone, customer_email, customer_name, channel, offset_days
--   }]
-- }

-- ── Hard DB-level de-dupe: unique expression index ────────────────────────────
-- Covers exactly the auto-reminder claim rows: type = 'reminder_sent' AND the
-- meta jsonb object contains the 'offset_days' key. Manual reminder events
-- (type = 'reminder_sent' without offset_days in meta) are excluded by the
-- partial WHERE clause and are unaffected by this constraint.
CREATE UNIQUE INDEX IF NOT EXISTS invoice_events_reminder_dedup_idx
  ON public.invoice_events (invoice_id, ((meta->>'offset_days')::int))
  WHERE type = 'reminder_sent' AND meta ? 'offset_days';

-- ── Candidate scan index ──────────────────────────────────────────────────────
-- invoices_overdue_sweep_idx covers only status IN ('sent','viewed'). The
-- reminder candidate scan also needs 'overdue' and 'partial'. This broader
-- partial index enables an index scan instead of a full sequential scan.
CREATE INDEX IF NOT EXISTS invoices_reminder_candidate_idx
  ON public.invoices (due_date)
  WHERE status IN ('sent', 'viewed', 'overdue', 'partial');

-- ── RPC: claim_due_reminders ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_due_reminders()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_ist_today   date;
  v_result      jsonb;
BEGIN
  -- Compute IST calendar date once; reuse in all predicates.
  v_ist_today := (now() AT TIME ZONE 'Asia/Kolkata')::date;

  -- ── Claim step: writable CTE ──────────────────────────────────────────────
  -- candidates: all (invoice, offset) pairs eligible for a reminder today.
  -- inserted: INSERT ... ON CONFLICT DO NOTHING — only genuinely new rows
  --   are returned via RETURNING. Pairs already claimed this day are silently
  --   discarded by the unique expression index.
  -- The final SELECT aggregates the inserted rows joined back to candidates
  -- for the display fields (invoice_number, tokens, contact info) that are
  -- not carried in invoice_events.RETURNING.
  WITH candidates AS (
    SELECT
      i.id                           AS invoice_id,
      i.business_id,
      i.number                       AS invoice_number,
      i.public_token,
      i.due_date,
      c.phone                        AS customer_phone,
      c.email                        AS customer_email,
      c.name                         AS customer_name,
      rr.channel,
      (v_ist_today - i.due_date)     AS offset_days
    FROM   public.invoices i
    JOIN   public.businesses b
           ON  b.id    = i.business_id
           AND b.plan  = 'pro'
    JOIN   public.reminder_rules rr
           ON  rr.business_id = i.business_id
           AND rr.enabled     = true
    LEFT JOIN public.customers c
           ON  c.id = i.customer_id
    WHERE  i.status       IN ('sent', 'viewed', 'overdue', 'partial')
      AND  i.due_date     IS NOT NULL
      AND  i.public_token IS NOT NULL
      AND  (v_ist_today - i.due_date) = ANY(rr.offsets_days)
  ),
  inserted AS (
    INSERT INTO public.invoice_events
      (business_id, invoice_id, type, channel, meta)
    SELECT
      cand.business_id,
      cand.invoice_id,
      'reminder_sent',
      cand.channel,
      jsonb_build_object(
        'offset_days', cand.offset_days,
        'source',      'auto',
        'due_date',    cand.due_date
      )
    FROM candidates cand
    ON CONFLICT (invoice_id, ((meta->>'offset_days')::int))
      WHERE type = 'reminder_sent' AND meta ? 'offset_days'
    DO NOTHING
    RETURNING id, invoice_id, business_id, channel,
              (meta->>'offset_days')::int AS offset_days
  )
  SELECT
    jsonb_build_object(
      'claimed_count', COALESCE(COUNT(ins.id), 0),
      'reminders', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'event_id',       ins.id,
            'invoice_id',     ins.invoice_id,
            'business_id',    ins.business_id,
            'invoice_number', cand.invoice_number,
            'public_token',   cand.public_token,
            'customer_phone', cand.customer_phone,
            'customer_email', cand.customer_email,
            'customer_name',  cand.customer_name,
            'channel',        ins.channel,
            'offset_days',    ins.offset_days
          )
        ),
        '[]'::jsonb
      )
    )
  INTO v_result
  FROM inserted ins
  JOIN candidates cand
    ON  cand.invoice_id  = ins.invoice_id
    AND cand.offset_days = ins.offset_days;

  RETURN COALESCE(
    v_result,
    jsonb_build_object('claimed_count', 0, 'reminders', '[]'::jsonb)
  );
END;
$$;

-- ── Grants ──────────────────────────────────────────────────────────────────
-- service_role only — this is a background cron RPC with no auth context.
GRANT EXECUTE ON FUNCTION public.claim_due_reminders()
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.claim_due_reminders()
  FROM PUBLIC, anon, authenticated;
