-- AP-18: record_payment RPC
--
-- Inserts one payments row and atomically recomputes invoices.amount_paid
-- from the full sum of all payments for that invoice (never += arithmetic).
-- Uses SELECT ... FOR UPDATE to prevent concurrent over-collection.
-- The overpayment guard uses a fresh SUM from the payments table (computed
-- under the invoice row lock) rather than the stored amount_paid column,
-- so it is correct even if the column has drifted from reality.
--
-- Payments RLS already has all 5 policies from AP-8 (tenant: owner read/insert/
-- update/delete + anon deny). No new policy work needed here.
-- payments_invoice_id_idx already exists from AP-8 for the SUM recompute.

-- ── RPC ──────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_payment(
  p_business_id uuid,
  p_invoice_id  uuid,
  p_amount      int,
  p_method      text    DEFAULT 'upi',
  p_reference   text    DEFAULT NULL,
  p_note        text    DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
declare
  v_invoice      record;
  v_current_paid int;   -- fresh SUM from payments, computed under the invoice lock
  v_new_paid     int;
  v_new_status   text;
  v_paid_at      timestamptz;
begin
  -- ── Input guard ──────────────────────────────────────────────────────────────
  if p_amount <= 0 then
    raise exception 'payment amount must be greater than zero';
  end if;

  -- ── Membership guard ─────────────────────────────────────────────────────────
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  -- ── Row-lock the invoice: ownership + existence guard ────────────────────────
  -- FOR UPDATE ensures two concurrent record_payment calls cannot both pass the
  -- overpayment guard and over-collect. All reads from the payments table that
  -- follow are consistent with this lock (same transaction snapshot).
  select id, business_id, status, total, amount_paid
    into v_invoice
    from invoices
   where id = p_invoice_id
     and business_id = p_business_id
  for update;

  if not found then
    raise exception 'invoice not found';
  end if;

  -- ── Payable-status guard ─────────────────────────────────────────────────────
  -- Allowed: sent, viewed, partial, overdue, pending
  -- Rejected: draft, cancelled, paid
  if v_invoice.status = 'paid' then
    raise exception 'invoice is already paid';
  end if;

  if v_invoice.status not in ('sent', 'viewed', 'partial', 'overdue', 'pending') then
    raise exception 'invoice is not payable';
  end if;

  -- ── Fresh SUM under lock ──────────────────────────────────────────────────────
  -- Compute the true current sum from the payments table now that the invoice
  -- row is locked. This is the source of truth for both the overpayment guard
  -- and the final amount_paid update — the stored column is NOT used for either.
  select coalesce(sum(amount), 0)
    into v_current_paid
    from payments
   where invoice_id = p_invoice_id;

  -- ── Overpayment guard (strictly-over only) ────────────────────────────────────
  -- Uses the fresh SUM (not invoices.amount_paid) so the guard is correct even if
  -- the stored column drifted from reality due to an out-of-band correction.
  if (v_current_paid + p_amount) > v_invoice.total then
    raise exception 'payment would exceed invoice total (overpayment not allowed)';
  end if;

  -- ── Insert the payment row ────────────────────────────────────────────────────
  insert into payments (
    business_id,
    invoice_id,
    amount,
    method,
    reference,
    note,
    recorded_by
  ) values (
    p_business_id,
    p_invoice_id,
    p_amount,
    coalesce(p_method, 'upi'),
    p_reference,
    p_note,
    (select auth.uid())
  );

  -- ── Recompute amount_paid from the table — NEVER stale-column arithmetic ──────
  select coalesce(sum(amount), 0)
    into v_new_paid
    from payments
   where invoice_id = p_invoice_id;

  -- ── Determine new status and paid_at ─────────────────────────────────────────
  if v_new_paid >= v_invoice.total then
    v_new_status := 'paid';
    v_paid_at    := now();
  else
    v_new_status := 'partial';
    v_paid_at    := null;
  end if;

  -- ── Update the invoice ───────────────────────────────────────────────────────
  update invoices
     set amount_paid = v_new_paid,
         status      = v_new_status::invoice_status,
         paid_at     = v_paid_at,
         updated_at  = now()
   where id = p_invoice_id
     and business_id = p_business_id;

  return jsonb_build_object(
    'invoice_id',  p_invoice_id,
    'amount_paid', v_new_paid,
    'status',      v_new_status,
    'paid_at',     v_paid_at
  );
end;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.record_payment(uuid, uuid, int, text, text, text)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION public.record_payment(uuid, uuid, int, text, text, text)
  FROM PUBLIC, anon;
