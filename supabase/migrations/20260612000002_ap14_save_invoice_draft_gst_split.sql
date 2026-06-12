-- AP-14: Rewrite save_invoice_draft to persist GST split + round_off.
--
-- Changes from AP-13:
--   - New params: p_cgst, p_sgst, p_igst, p_round_off (invoice-level split + rounding),
--     p_is_interstate, p_gst_enabled (tax regime flags).
--   - INSERT path writes all six new columns onto invoices.
--   - UPDATE path sets all six new columns alongside existing fields.
--   - Per-line insert reads cgst/sgst/igst from each p_line_items element.
--   - Return payload adds invoice-level cgst/sgst/igst/round_off/is_interstate/gst_enabled,
--     and per-line cgst/sgst/igst in the json_agg.
--
-- Preserved unchanged:
--   - SECURITY INVOKER, SET search_path = public, pg_temp
--   - Membership guard (not a member of this business)
--   - INSERT/UPDATE branching
--   - draft-status check (not a draft)
--   - not-found check (not found)
--   - Atomic line replace (DELETE + bulk INSERT)
--   - updated_at explicit bump on UPDATE
--   - All existing return keys

-- Revoke old signature first to avoid ambiguity from old overload.
revoke execute on function public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb
) from public, anon, authenticated;

drop function if exists public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb
);

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
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_invoice_id  uuid;
  v_line        jsonb;
  v_result      jsonb;
begin
  -- ── Membership guard ───────────────────────────────────────────────────────
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
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

    if not exists (
      select 1 from public.invoices
      where id = p_invoice_id
        and status = 'draft'
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
  -- Delete all existing lines for this invoice (uses invoice_line_items_invoice_id_idx)
  delete from public.invoice_line_items
  where invoice_id = v_invoice_id;

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

  -- ── Build return payload ───────────────────────────────────────────────────
  select jsonb_build_object(
    'invoice_id',    v_invoice_id,
    'status',        'draft',
    'subtotal',      p_subtotal,
    'tax_total',     p_tax_total,
    'total',         p_total,
    'cgst',          p_cgst,
    'sgst',          p_sgst,
    'igst',          p_igst,
    'round_off',     p_round_off,
    'is_interstate', p_is_interstate,
    'gst_enabled',   p_gst_enabled,
    'line_items', coalesce(
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
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ── Grants: authenticated only ────────────────────────────────────────────────
revoke execute on function public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb, int4, int4, int4, int4, boolean, boolean
) from public, anon;

grant execute on function public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb, int4, int4, int4, int4, boolean, boolean
) to authenticated;
