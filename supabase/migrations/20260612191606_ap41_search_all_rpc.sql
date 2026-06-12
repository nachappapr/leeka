-- AP-41: search_all RPC + GIN trigram index on invoices.number
--
-- Adds:
--   1. GIN trigram index on invoices(number) for number prefix / trigram search
--   2. Btree index on invoices(business_id, total) for rupee-amount range lookups
--   3. search_all(p_business_id, p_query, p_limit) SECURITY INVOKER RPC
--      Unified search across invoices + customers returning jsonb rows.
--
-- Notes:
--   - customers_name_trgm_idx already exists (AP-10); this migration skips it.
--   - pg_trgm is in the extensions schema (AP-2); DO NOT create it.
--   - SECURITY INVOKER: RLS on invoices/customers gates rows — no anon access path.
--   - Amount search: p_query digits-only → parsed as rupees → paise range match.
--   - Empty/whitespace p_query → recent invoices (issue_date desc) + recent customers
--     (created_at desc), p_limit each, so the palette idle state can be live.
--   - Customer outstanding figure: omitted (would require per-customer subquery
--     aggregation; see FOLLOW-UPS in AP-41 notes).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. GIN trigram index on invoices(number)
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists invoices_number_trgm_idx on public.invoices
  using gin (number extensions.gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Btree index on invoices(business_id, total) for rupee-amount range queries
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists invoices_business_id_total_idx on public.invoices
  (business_id, total);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. search_all RPC
--    Returns setof jsonb with shape:
--      invoices: { kind:"invoice", id, number, customer_name, issue_date,
--                  total, status }
--      customers: { kind:"customer", id, name, phone }
--
--    Match logic (when p_query is non-empty):
--      Invoices:
--        a) number trigram: number ilike '%'||query||'%'
--        b) customer name: joined customer.name ilike '%'||query||'%'
--        c) amount: when query parses to a numeric rupee value, match invoices
--           whose total (paise) falls in [floor(rupees)*100, ceil(rupees)*100].
--           All three branches are unioned (OR semantics).
--      Customers:
--        a) name trigram: name ilike '%'||query||'%'
--        b) phone: normalised digit-only substring ≥3 digits
--
--    Ordered by similarity DESC within each kind, then capped at p_limit per kind.
--    Membership guard: caller must be in business_members for p_business_id.
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

-- Authenticated-only: revoke public/anon, grant to authenticated
revoke execute on function public.search_all(uuid, text, int) from public, anon;
grant  execute on function public.search_all(uuid, text, int) to authenticated;
