-- AP-13: save_invoice_draft RPC
--
-- Implements atomic INSERT-or-UPDATE of an invoice draft + its line items.
--
-- Design decisions:
--   - SECURITY INVOKER: runs as the authenticated user, so existing RLS
--     policies on invoices and invoice_line_items enforce access automatically.
--   - Totals (subtotal, tax_total, total) are passed in from the Server Action
--     which computed them from the validated payload. The action is the single
--     source of truth — this RPC stores what it receives. If defence-in-depth
--     recomputation is added later it belongs in AP-14.
--   - updated_at is set explicitly on the UPDATE path because there is NO
--     updated_at auto-bump trigger on invoices (only trg_invoices_set_public_token
--     fires, and only on INSERT). Confirmed via information_schema.triggers.
--   - Line items are REPLACED atomically: DELETE all existing rows for the
--     invoice_id, then bulk INSERT from the payload. This avoids drift from
--     partial updates and keeps position sequencing deterministic.
--   - cgst / sgst / igst / round_off remain at their column defaults (0).
--     AP-14 will extend this RPC to compute the CGST/SGST/IGST split.
--
-- Parameters:
--   p_business_id  uuid      — must match a business_members row for the caller
--   p_invoice_id   uuid      — NULL → INSERT new draft; non-NULL → UPDATE
--   p_customer_id  uuid      — FK to customers; required
--   p_notes        text      — optional free-text notes
--   p_subtotal     int4      — paise; computed by Server Action
--   p_tax_total    int4      — paise; computed by Server Action (flat rate)
--   p_total        int4      — paise; computed by Server Action
--   p_line_items   jsonb     — array of line-item objects (see inline comment)
--
-- Returns jsonb:
--   { invoice_id, status, subtotal, tax_total, total, line_items: [...] }

create or replace function public.save_invoice_draft(
  p_business_id  uuid,
  p_invoice_id   uuid    default null,
  p_customer_id  uuid    default null,
  p_notes        text    default null,
  p_subtotal     int4    default 0,
  p_tax_total    int4    default 0,
  p_total        int4    default 0,
  p_line_items   jsonb   default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_invoice_id  uuid;
  v_line        jsonb;
  v_position    int;
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
      created_by
    ) values (
      p_business_id,
      p_customer_id,
      'draft',
      null,                        -- drafts have no number assigned
      p_subtotal,
      p_tax_total,
      p_total,
      p_notes,
      (select auth.uid())
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
      customer_id = p_customer_id,
      subtotal    = p_subtotal,
      tax_total   = p_tax_total,
      total       = p_total,
      notes       = p_notes,
      updated_at  = now()          -- explicit: no auto-bump trigger on UPDATE
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
  --     gst_rate, line_subtotal, line_tax, line_total }
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
      line_total
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
      (v_line->>'line_total')::int4
    );
  end loop;

  -- ── Build return payload ───────────────────────────────────────────────────
  select jsonb_build_object(
    'invoice_id', v_invoice_id,
    'status',     'draft',
    'subtotal',   p_subtotal,
    'tax_total',  p_tax_total,
    'total',      p_total,
    'line_items', coalesce(
      (
        select json_agg(
          jsonb_build_object(
            'position',     ili.position,
            'name',         ili.name,
            'hsn_sac',      ili.hsn_sac,
            'qty',          ili.qty,
            'unit_price',   ili.unit_price,
            'discount',     ili.discount,
            'gst_rate',     ili.gst_rate,
            'line_subtotal', ili.line_subtotal,
            'line_tax',     ili.line_tax,
            'line_total',   ili.line_total
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
  uuid, uuid, uuid, text, int4, int4, int4, jsonb
) from public, anon;

grant execute on function public.save_invoice_draft(
  uuid, uuid, uuid, text, int4, int4, int4, jsonb
) to authenticated;
