-- ============================================================
-- AP-9 fix: two corrections to the RPC migration
--
-- Fix 1: gen_random_bytes lives in extensions schema, not public.
--         Use extensions.gen_random_bytes(24) explicitly.
--         (search_path = public, pg_temp excludes extensions schema)
--
-- Fix 2: invoices_set_public_token trigger function was declared
--         SECURITY DEFINER unnecessarily. Trigger functions don't
--         need SECURITY DEFINER — they run as the invoking session.
--         Switch to SECURITY INVOKER to remove the advisor warning
--         and reduce the attack surface.
--         The REVOKE on this function stays in place.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Replace trigger function: SECURITY INVOKER + correct bytea path
-- ------------------------------------------------------------
create or replace function public.invoices_set_public_token()
  returns trigger
  language plpgsql
  security invoker
  set search_path = public, extensions, pg_temp
as $$
begin
  if new.public_token is null or new.public_token = '' then
    new.public_token := encode(gen_random_bytes(24), 'base64');
  end if;
  return new;
end;
$$;

-- Revoke any execute grants from public/anon (trigger functions shouldn't be callable directly)
revoke execute on function public.invoices_set_public_token() from public;
revoke execute on function public.invoices_set_public_token() from anon;
revoke execute on function public.invoices_set_public_token() from authenticated;

-- ------------------------------------------------------------
-- 2. Replace get_public_invoice: use extensions.gen_random_bytes
--    path is already correct in the main function (no bytea usage),
--    but ensure search_path includes extensions for consistency
--    and fix the status field to reflect post-side-effect state.
-- ------------------------------------------------------------
create or replace function public.get_public_invoice(p_token text)
  returns jsonb
  language plpgsql
  security definer
  set search_path = public, extensions, pg_temp
as $$
declare
  v_invoice       public.invoices%rowtype;
  v_business      public.businesses%rowtype;
  v_customer_name text;
  v_line_items    jsonb;
  v_result        jsonb;
  v_status_out    text;
  v_rows          integer;
begin
  -- Guard: reject null/empty token immediately
  if p_token is null or p_token = '' then
    return null;
  end if;

  -- Fetch invoice by token (single row, UNIQUE index hit)
  select * into v_invoice
  from public.invoices
  where public_token = p_token;

  -- Reject: not found
  if not found then
    return null;
  end if;

  -- Reject: draft or cancelled
  if v_invoice.status in ('draft', 'cancelled') then
    return null;
  end if;

  -- Fetch business (only the fields we expose)
  select * into v_business
  from public.businesses
  where id = v_invoice.business_id;

  -- Fetch customer name only (no PII)
  select name into v_customer_name
  from public.customers
  where id = v_invoice.customer_id;

  -- Fetch line items (all non-PII fields)
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'position',      li.position,
        'name',          li.name,
        'hsn_sac',       li.hsn_sac,
        'qty',           li.qty,
        'unit_price',    li.unit_price,
        'discount',      li.discount,
        'gst_rate',      li.gst_rate,
        'line_subtotal', li.line_subtotal,
        'line_tax',      li.line_tax,
        'line_total',    li.line_total
      )
      order by li.position
    ),
    '[]'::jsonb
  ) into v_line_items
  from public.invoice_line_items li
  where li.invoice_id = v_invoice.id;

  -- Compute the output status: if we're about to flip 'sent' → 'viewed', report 'viewed'
  v_status_out := v_invoice.status::text;

  -- Side-effect: mark as viewed if status was 'sent' (first view only, idempotent).
  -- The UPDATE is guarded by `viewed_at IS NULL`; the event INSERT is gated on
  -- ROW_COUNT so concurrent requests cannot produce duplicate invoice_events rows.
  if v_invoice.status = 'sent' then
    v_status_out := 'viewed';

    update public.invoices
    set
      status    = 'viewed',
      viewed_at = now()
    where id = v_invoice.id
      and viewed_at is null;

    get diagnostics v_rows = row_count;

    if v_rows > 0 then
      insert into public.invoice_events (business_id, invoice_id, type, channel)
      values (v_invoice.business_id, v_invoice.id, 'viewed', 'web');
    end if;
  end if;

  -- Build redacted response (no notes, no PII)
  v_result := jsonb_build_object(
    'invoice_id',         v_invoice.id,
    'invoice_number',     v_invoice.number,
    'status',             v_status_out,
    'issue_date',         v_invoice.issue_date,
    'due_date',           v_invoice.due_date,
    'is_interstate',      v_invoice.is_interstate,
    'gst_enabled',        v_invoice.gst_enabled,
    'subtotal',           v_invoice.subtotal,
    'discount',           v_invoice.discount,
    'cgst',               v_invoice.cgst,
    'sgst',               v_invoice.sgst,
    'igst',               v_invoice.igst,
    'tax_total',          v_invoice.tax_total,
    'round_off',          v_invoice.round_off,
    'total',              v_invoice.total,
    'amount_paid',        v_invoice.amount_paid,
    'terms',              v_invoice.terms,
    'business_name',      v_business.name,
    'business_gstin',     v_business.gstin,
    'business_upi_id',    v_business.upi_id,
    'business_logo_url',  v_business.logo_url,
    'customer_name',      v_customer_name,
    'line_items',         v_line_items
  );

  return v_result;
end;
$$;

-- Grants remain: revoke from PUBLIC, grant to anon + authenticated
revoke execute on function public.get_public_invoice(text) from public;
grant  execute on function public.get_public_invoice(text) to anon, authenticated;
