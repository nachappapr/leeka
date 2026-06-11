-- ============================================================
-- AP-9: Public token access (RPC)
--
-- 1. BEFORE INSERT trigger on invoices: auto-populate public_token
--    with encode(gen_random_bytes(24), 'base64') when null.
-- 2. Index on invoices(public_token) to make RPC lookup O(log n).
-- 3. get_public_invoice(p_token text) SECURITY DEFINER RPC:
--    - Callable by anon + authenticated (revoke from public)
--    - Returns redacted composite: no PII, no internal notes
--    - Rejects draft/cancelled/null/invalid tokens
--    - Side-effect: first-time view of a 'sent' invoice marks it
--      viewed and inserts an invoice_events row
-- ============================================================

-- ------------------------------------------------------------
-- 1. Trigger function: auto-generate public_token on insert
-- ------------------------------------------------------------
create or replace function public.invoices_set_public_token()
  returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  if new.public_token is null or new.public_token = '' then
    new.public_token := encode(gen_random_bytes(24), 'base64');
  end if;
  return new;
end;
$$;

-- Drop trigger if already exists (idempotent)
drop trigger if exists trg_invoices_set_public_token on public.invoices;

create trigger trg_invoices_set_public_token
  before insert on public.invoices
  for each row
  execute function public.invoices_set_public_token();

-- ------------------------------------------------------------
-- 2. Index on public_token for fast RPC lookup
--    (UNIQUE constraint already exists, which creates a unique
--     index — so we don't need a second index; confirm below)
-- ------------------------------------------------------------
-- The UNIQUE constraint on invoices.public_token already
-- creates a btree index. No additional index needed.

-- ------------------------------------------------------------
-- 3. SECURITY DEFINER RPC: get_public_invoice
-- ------------------------------------------------------------
create or replace function public.get_public_invoice(p_token text)
  returns jsonb
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  v_invoice       public.invoices%rowtype;
  v_business      public.businesses%rowtype;
  v_customer_name text;
  v_line_items    jsonb;
  v_result        jsonb;
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

  -- Side-effect: mark as viewed if status was 'sent' (first view only)
  if v_invoice.status = 'sent' then
    update public.invoices
    set
      status    = 'viewed',
      viewed_at = now()
    where id = v_invoice.id
      and viewed_at is null;

    -- Insert invoice_events row for this view
    insert into public.invoice_events (business_id, invoice_id, type, channel)
    values (v_invoice.business_id, v_invoice.id, 'viewed', 'web');
  end if;

  -- Build redacted response (no notes, no PII)
  v_result := jsonb_build_object(
    'invoice_id',         v_invoice.id,
    'invoice_number',     v_invoice.number,
    'status',             case
                            when v_invoice.status = 'sent' then 'viewed'
                            else v_invoice.status::text
                          end,
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

-- ------------------------------------------------------------
-- 4. Grants: revoke from PUBLIC, grant to anon + authenticated
-- ------------------------------------------------------------
revoke execute on function public.get_public_invoice(text) from public;
grant  execute on function public.get_public_invoice(text) to anon, authenticated;

-- Also ensure trigger function is not executable by public directly
revoke execute on function public.invoices_set_public_token() from public;
