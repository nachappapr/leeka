-- AP-16 Unit 2: issue_invoice RPC
--
-- Transitions a 'draft' invoice to 'sent' in one atomic function body:
--   1. Membership + ownership guards (SECURITY INVOKER — RLS also applies)
--   2. Double-issue guard: raise before drawing a sequence number so no number
--      is ever burned on a re-issue attempt
--   3. Draw the next number via next_invoice_number(p_business_id, <stored issue_date>)
--      — passes the invoice's own issue_date so the FY matches the invoice, not the
--      wall-clock date of issuing
--   4. UPDATE invoices: number + status + sent_at in one statement
--
-- Gap-free atomicity: next_invoice_number's upsert and the UPDATE below share
-- the same implicit plpgsql transaction. If the UPDATE fails for any reason,
-- the transaction rolls back, including the sequence increment. No autonomous
-- transaction boundary exists between the two operations.

create or replace function public.issue_invoice(
  p_business_id uuid,
  p_invoice_id  uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_invoice        record;
  v_number         text;
  v_result         jsonb;
begin
  -- ── Membership guard ─────────────────────────────────────────────────────────
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  -- ── Read invoice row (ownership + existence guard) ────────────────────────────
  select id, business_id, number, status, issue_date
    into v_invoice
    from invoices
   where id = p_invoice_id
     and business_id = p_business_id;

  if not found then
    raise exception 'invoice not found';
  end if;

  -- ── Double-issue guard ────────────────────────────────────────────────────────
  -- Check both status and number: a draft that somehow already has a number
  -- (data anomaly) should also be blocked from drawing a second number.
  if v_invoice.status <> 'draft' or v_invoice.number is not null then
    raise exception 'invoice is not a draft';
  end if;

  -- ── Draw the next invoice number ──────────────────────────────────────────────
  -- Pass the invoice's stored issue_date so the FY derives from when the invoice
  -- was created, not the wall-clock time of issuing. This is important when an
  -- invoice created in FY 2025-26 is issued after April 1 of the next FY.
  v_number := public.next_invoice_number(p_business_id, v_invoice.issue_date);

  -- ── Transition: draft → sent ──────────────────────────────────────────────────
  -- sent_at records the moment the invoice was formally issued/dispatched.
  -- sent = the issued/dispatched state in the invoice_status enum.
  update invoices
     set number   = v_number,
         status   = 'sent',
         sent_at  = now(),
         updated_at = now()
   where id = p_invoice_id
     and business_id = p_business_id
     and status = 'draft';

  -- Guard: if no row was updated (status changed between the SELECT and UPDATE),
  -- abort — do not return a silently wrong result.
  if not found then
    raise exception 'invoice is not a draft';
  end if;

  v_result := jsonb_build_object(
    'invoice_id', p_invoice_id,
    'number',     v_number,
    'status',     'sent'
  );

  return v_result;
end;
$$;

-- ── Grants: authenticated only ────────────────────────────────────────────────
revoke execute on function public.issue_invoice(uuid, uuid) from public, anon;
grant execute on function public.issue_invoice(uuid, uuid) to authenticated;
