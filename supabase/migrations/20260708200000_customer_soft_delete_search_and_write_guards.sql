-- Issue #31: Deleted customers excluded from search + write guards against
-- stale sessions (frontend half of PRD #23 customer soft delete, backend unit).
--
-- Builds on #30 (20260707100000_customer_soft_delete.sql: customers.deleted_at,
-- delete_customer RPC, list_customers_page filter).
--
-- Four CREATE OR REPLACE changes, each reproducing the function's current live
-- definition byte-for-byte except for the stated edit:
--
--   1. search_customers (20260611230002) — add `and c.deleted_at is null` to
--      the typeahead used by the invoice-creation customer picker.
--   2. search_all (20260612191606) — add `and c.deleted_at is null` to BOTH
--      customer-table branches (idle-state recent customers + active
--      name/phone search) only. The invoice branches (idle + active) are left
--      byte-for-byte untouched: past invoices must keep surfacing a deleted
--      customer's name via the existing `left join public.customers c`, so a
--      historical invoice search never looks like it lost its customer. This
--      asymmetry (invoices see deleted customers, the customer-kind results do
--      not) is intentional, not an oversight.
--   3. save_invoice_draft — the live signature is NOT the AP-14 jsonb-returning
--      one anymore: issue #9 (20260628010000_lifecycle_rpcs_returns_table.sql,
--      then 20260628020000_lifecycle_rpcs_qualify_column_refs.sql) rewrote it to
--      `RETURNS TABLE(...)` with RETURN QUERY and table-qualified `invoices.status`
--      / `invoice_line_items.invoice_id` refs to sidestep the 42702 OUT-column
--      trap. This migration reproduces THAT definition byte-for-byte and adds one
--      guard, evaluated before the INSERT/UPDATE branch so it covers both a
--      brand-new draft and a stale-tab re-save of an existing draft: refuse
--      when p_customer_id points at a row with deleted_at is not null. Raised
--      via the same `raise exception '<message>'` mechanism every other guard
--      in this function already uses. The chosen message deliberately avoids
--      the substrings ("not a member", "not a draft", "not found") that
--      src/app/(app)/invoices/actions.ts's mapSaveDraftError special-cases, so
--      it falls through to that helper's existing generic fallback string
--      rather than being mislabelled as "Invoice not found" (which would be
--      wrong — it's the customer, not the invoice, that's missing). No client
--      change required. Return type is unchanged, so this is CREATE OR REPLACE,
--      not a DROP + CREATE.
--   4. upsert_customer (20260614100000, blank-to-null fix) — the existing
--      UPDATE-path ownership check already raises 'customer not found in this
--      business' when the row doesn't belong to the caller's business; adding
--      `and deleted_at is null` to that same exists-check makes a soft-deleted
--      row hit the identical, already-handled error path. Reuses the literal
--      existing message — src/app/(app)/customers/actions.ts's
--      upsertCustomerAction doesn't inspect error.message at all (every RPC
--      error already collapses to one generic string), so this is a no-op for
--      the client contract. The INSERT path is untouched: re-adding a
--      previously-deleted phone number as a new customer must keep working
--      (no unique constraint on customers.phone — confirmed in #30).
--
-- 42702 note: none of these four functions is RETURNS TABLE, so the
-- OUT-column-name/body-scope collision documented in 20260628020000 does not
-- apply here — but every column reference in the edited bodies stays
-- table-qualified anyway, matching this repo's established convention.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. search_customers — exclude soft-deleted customers
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.search_customers(
  p_business_id uuid,
  p_query       text,
  p_limit       int  default 20
)
returns setof jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  -- Membership guard: caller must be a member of the business
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  return query
  select jsonb_build_object(
    'id',         c.id,
    'name',       c.name,
    'phone',      c.phone,
    'email',      c.email,
    'state_code', c.state_code
  )
  from public.customers c
  where c.business_id = p_business_id
    and c.deleted_at is null
    and (p_query = '' or c.name ilike '%' || p_query || '%')
  order by c.name
  limit p_limit;
end;
$$;

revoke execute on function public.search_customers(uuid, text, int) from public, anon;
grant  execute on function public.search_customers(uuid, text, int) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. search_all — exclude soft-deleted customers from the customer-kind
--    branches only; invoice branches keep joining every customer (including
--    deleted ones) so historical invoices keep showing the customer's name.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.search_all(
  p_business_id  uuid,
  p_query        text,
  p_limit        int  default 8
)
returns setof jsonb
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
declare
  v_trimmed   text;
  v_digits    text;
  v_rupees    numeric;
  v_paise_lo  bigint;
  v_paise_hi  bigint;
  v_is_amount boolean := false;
begin
  -- Membership guard
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  v_trimmed := trim(p_query);

  -- ── Idle state: empty query → recent rows ──────────────────────────────────
  if v_trimmed = '' then
    return query
    select jsonb_build_object(
      'kind',          'invoice',
      'id',            i.id,
      'number',        i.number,
      'customer_name', c.name,
      'issue_date',    i.issue_date,
      'total',         i.total,
      'status',        i.status::text
    )
    from public.invoices i
    left join public.customers c on c.id = i.customer_id
    where i.business_id = p_business_id
      and i.status <> 'cancelled'
    order by i.issue_date desc, i.created_at desc
    limit p_limit;

    return query
    select jsonb_build_object(
      'kind',  'customer',
      'id',    c.id,
      'name',  c.name,
      'phone', c.phone
    )
    from public.customers c
    where c.business_id = p_business_id
      and c.deleted_at is null
    order by c.created_at desc
    limit p_limit;

    return;
  end if;

  -- ── Amount detection: strip commas/spaces, check numeric ──────────────────
  -- A query is treated as a rupee amount when it consists solely of digits,
  -- optional commas (Indian grouping), and at most one decimal point.
  v_digits := regexp_replace(v_trimmed, '[,\s]', '', 'g');
  if v_digits ~ '^[0-9]+(\.[0-9]{1,2})?$' then
    v_is_amount := true;
    v_rupees   := v_digits::numeric;
    -- Range: treat as prefix match on rupee value.
    -- e.g. "1200" matches ₹1200.00 to ₹1200.99 (paise 120000–120099).
    -- e.g. "1200.5" matches ₹1200.50 to ₹1200.50 (exact paise 120050).
    if v_digits ~ '\.' then
      -- Exact paise value when decimal provided
      v_paise_lo := floor(v_rupees * 100)::bigint;
      v_paise_hi := ceil(v_rupees * 100)::bigint;
    else
      -- Rupee prefix: match the whole rupee band (ignore paise portion)
      v_paise_lo := (v_rupees * 100)::bigint;
      v_paise_hi := (v_rupees * 100 + 99)::bigint;
    end if;
  end if;

  -- ── Invoice search ────────────────────────────────────────────────────────
  return query
  select jsonb_build_object(
    'kind',          'invoice',
    'id',            i.id,
    'number',        i.number,
    'customer_name', c.name,
    'issue_date',    i.issue_date,
    'total',         i.total,
    'status',        i.status::text
  )
  from public.invoices i
  left join public.customers c on c.id = i.customer_id
  where i.business_id = p_business_id
    and i.status <> 'cancelled'
    and (
      (i.number  ilike '%' || v_trimmed || '%')
      or (c.name ilike '%' || v_trimmed || '%')
      or (v_is_amount and i.total between v_paise_lo and v_paise_hi)
    )
  order by
    greatest(
      similarity(coalesce(i.number, ''), v_trimmed),
      similarity(coalesce(c.name, ''),   v_trimmed)
    ) desc,
    i.issue_date desc
  limit p_limit;

  -- ── Customer search ───────────────────────────────────────────────────────
  return query
  with digit_query as (
    -- Extract digit-only run from query for phone matching (≥3 digits required)
    select regexp_replace(v_trimmed, '[^0-9]', '', 'g') as dq
  )
  select jsonb_build_object(
    'kind',  'customer',
    'id',    c.id,
    'name',  c.name,
    'phone', c.phone
  )
  from public.customers c, digit_query d
  where c.business_id = p_business_id
    and c.deleted_at is null
    and (
      c.name  ilike '%' || v_trimmed || '%'
      or (
        length(d.dq) >= 3
        and regexp_replace(coalesce(c.phone, ''), '[^0-9]', '', 'g')
              like '%' || d.dq || '%'
      )
    )
  order by similarity(c.name, v_trimmed) desc, c.name
  limit p_limit;
end;
$$;

revoke execute on function public.search_all(uuid, text, int) from public, anon;
grant  execute on function public.search_all(uuid, text, int) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. save_invoice_draft — refuse to attach a soft-deleted customer id
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.save_invoice_draft(
  p_business_id   uuid,
  p_invoice_id    uuid     default null,
  p_customer_id   uuid     default null,
  p_notes         text     default null,
  p_subtotal      int4     default 0,
  p_tax_total     int4     default 0,
  p_total         int4     default 0,
  p_line_items    jsonb    default '[]'::jsonb,
  p_cgst          int4     default 0,
  p_sgst          int4     default 0,
  p_igst          int4     default 0,
  p_round_off     int4     default 0,
  p_is_interstate boolean  default false,
  p_gst_enabled   boolean  default true
)
returns table (
  invoice_id    uuid,
  status        invoice_status,
  subtotal      int4,
  tax_total     int4,
  total         int4,
  cgst          int4,
  sgst          int4,
  igst          int4,
  round_off     int4,
  is_interstate boolean,
  gst_enabled   boolean,
  line_items    jsonb
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_invoice_id  uuid;
  v_line        jsonb;
begin
  -- ── Membership guard ───────────────────────────────────────────────────────
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  -- ── Soft-delete guard: refuse a stale-tab attach/re-save of a deleted
  --    customer (checked before INSERT/UPDATE so it covers both paths) ───────
  if p_customer_id is not null and exists (
    select 1 from public.customers
    where id = p_customer_id
      and deleted_at is not null
  ) then
    raise exception 'cannot attach a deleted customer to this invoice';
  end if;

  if p_invoice_id is null then
    -- ── INSERT path: create a new draft ───────────────────────────────────────
    insert into public.invoices (
      business_id,
      customer_id,
      status,
      number,
      subtotal,
      tax_total,
      total,
      notes,
      created_by,
      cgst,
      sgst,
      igst,
      round_off,
      is_interstate,
      gst_enabled
    ) values (
      p_business_id,
      p_customer_id,
      'draft',
      null,
      p_subtotal,
      p_tax_total,
      p_total,
      p_notes,
      (select auth.uid()),
      p_cgst,
      p_sgst,
      p_igst,
      p_round_off,
      p_is_interstate,
      p_gst_enabled
    )
    returning id into v_invoice_id;

  else
    -- ── UPDATE path: validate ownership + draft status ────────────────────────
    if not exists (
      select 1 from public.invoices
      where id = p_invoice_id
        and business_id = p_business_id
    ) then
      raise exception 'invoice not found in this business';
    end if;

    -- invoices.status qualified to avoid ambiguity with the OUT column `status`
    if not exists (
      select 1 from public.invoices
      where id = p_invoice_id
        and invoices.status = 'draft'
    ) then
      raise exception 'invoice is not a draft — cannot save over a non-draft invoice';
    end if;

    update public.invoices
    set
      customer_id   = p_customer_id,
      subtotal      = p_subtotal,
      tax_total     = p_tax_total,
      total         = p_total,
      notes         = p_notes,
      updated_at    = now(),
      cgst          = p_cgst,
      sgst          = p_sgst,
      igst          = p_igst,
      round_off     = p_round_off,
      is_interstate = p_is_interstate,
      gst_enabled   = p_gst_enabled
    where id = p_invoice_id
      and business_id = p_business_id;

    v_invoice_id := p_invoice_id;
  end if;

  -- ── Replace line items atomically ─────────────────────────────────────────
  -- invoice_line_items.invoice_id qualified to avoid ambiguity with the OUT
  -- column `invoice_id` (uses invoice_line_items_invoice_id_idx)
  delete from public.invoice_line_items
  where invoice_line_items.invoice_id = v_invoice_id;

  -- Bulk insert from payload
  -- Each element shape:
  --   { position, name, hsn_sac, qty, unit_price, discount,
  --     gst_rate, line_subtotal, line_tax, line_total, cgst, sgst, igst }
  for v_line in select * from jsonb_array_elements(p_line_items)
  loop
    insert into public.invoice_line_items (
      invoice_id,
      position,
      name,
      hsn_sac,
      qty,
      unit_price,
      discount,
      gst_rate,
      line_subtotal,
      line_tax,
      line_total,
      cgst,
      sgst,
      igst
    ) values (
      v_invoice_id,
      (v_line->>'position')::int,
      v_line->>'name',
      nullif(v_line->>'hsn_sac', ''),
      (v_line->>'qty')::numeric,
      (v_line->>'unit_price')::int4,
      (v_line->>'discount')::int4,
      (v_line->>'gst_rate')::numeric,
      (v_line->>'line_subtotal')::int4,
      (v_line->>'line_tax')::int4,
      (v_line->>'line_total')::int4,
      coalesce((v_line->>'cgst')::int4, 0),
      coalesce((v_line->>'sgst')::int4, 0),
      coalesce((v_line->>'igst')::int4, 0)
    );
  end loop;

  -- ── Return typed row ───────────────────────────────────────────────────────
  return query
    select
      v_invoice_id,
      'draft'::invoice_status,
      p_subtotal,
      p_tax_total,
      p_total,
      p_cgst,
      p_sgst,
      p_igst,
      p_round_off,
      p_is_interstate,
      p_gst_enabled,
      coalesce(
        (
          select json_agg(
            jsonb_build_object(
              'position',      ili.position,
              'name',          ili.name,
              'hsn_sac',       ili.hsn_sac,
              'qty',           ili.qty,
              'unit_price',    ili.unit_price,
              'discount',      ili.discount,
              'gst_rate',      ili.gst_rate,
              'line_subtotal', ili.line_subtotal,
              'line_tax',      ili.line_tax,
              'line_total',    ili.line_total,
              'cgst',          ili.cgst,
              'sgst',          ili.sgst,
              'igst',          ili.igst
            )
            order by ili.position
          )::jsonb
          from public.invoice_line_items ili
          where ili.invoice_id = v_invoice_id
        ),
        '[]'::jsonb
      );
end;
$$;

revoke execute on function public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb, int4, int4, int4, int4, boolean, boolean
) from public, anon;

grant execute on function public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb, int4, int4, int4, int4, boolean, boolean
) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. upsert_customer — refuse to UPDATE a soft-deleted row
--    (INSERT path untouched: re-adding a deleted customer's phone as a new
--    row must keep working — no unique constraint on customers.phone)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.upsert_customer(
  p_business_id     uuid,
  p_name            text,
  p_customer_id     uuid    default null,
  p_phone           text    default null,
  p_email           text    default null,
  p_gstin           text    default null,
  p_state_code      text    default null,
  p_city            text    default null,
  p_billing_address text    default null,
  p_notes           text    default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_id      uuid;
  v_row     public.customers%rowtype;
  v_phone   text := nullif(trim(coalesce(p_phone,           '')), '');
  v_email   text := nullif(trim(coalesce(p_email,           '')), '');
  v_gstin   text := nullif(trim(coalesce(p_gstin,           '')), '');
  v_sc      text := nullif(trim(coalesce(p_state_code,      '')), '');
  v_city    text := nullif(trim(coalesce(p_city,            '')), '');
  v_addr    text := nullif(trim(coalesce(p_billing_address, '')), '');
  v_notes   text := nullif(trim(coalesce(p_notes,           '')), '');
begin
  -- Membership guard: caller must be a member of the business
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  if p_customer_id is null then
    -- INSERT path
    insert into public.customers (
      business_id, name, phone, email, gstin,
      state_code, city, billing_address, notes
    ) values (
      p_business_id, p_name, v_phone, v_email, v_gstin,
      v_sc, v_city, v_addr, v_notes
    )
    returning id into v_id;
  else
    -- UPDATE path: verify customer belongs to this business and is not
    -- soft-deleted (a deleted row is treated identically to a not-found one)
    if not exists (
      select 1 from public.customers
      where id = p_customer_id
        and business_id = p_business_id
        and deleted_at is null
    ) then
      raise exception 'customer not found in this business';
    end if;

    update public.customers
    set
      name            = p_name,
      phone           = v_phone,
      email           = v_email,
      gstin           = v_gstin,
      state_code      = v_sc,
      city            = v_city,
      billing_address = v_addr,
      notes           = v_notes
    where id = p_customer_id
      and business_id = p_business_id;

    v_id := p_customer_id;
  end if;

  select * into v_row from public.customers where id = v_id;

  return jsonb_build_object(
    'id',              v_row.id,
    'name',            v_row.name,
    'phone',           v_row.phone,
    'email',           v_row.email,
    'gstin',           v_row.gstin,
    'state_code',      v_row.state_code,
    'city',            v_row.city,
    'billing_address', v_row.billing_address
  );
end;
$$;

revoke execute on function public.upsert_customer(
  uuid, text, uuid, text, text, text, text, text, text, text
) from public, anon;
grant execute on function public.upsert_customer(
  uuid, text, uuid, text, text, text, text, text, text, text
) to authenticated;
