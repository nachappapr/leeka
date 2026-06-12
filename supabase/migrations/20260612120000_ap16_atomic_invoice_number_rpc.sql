-- AP-16 Unit 1: next_invoice_number — atomic per-business, per-FY sequence increment.
--
-- Indian FY runs April 1 → March 31.
--   Issue date in Apr–Dec of year Y  → FY string "Y-(Y+1 mod 100)" e.g. "2025-26"
--   Issue date in Jan–Mar of year Y  → FY string "(Y-1)-YY"          e.g. "2025-26" for Mar 2026
-- Formula: fy_start_year = extract(year) - (1 if month <= 3 else 0)
--           fy_string = fy_start_year || '-' || lpad((fy_start_year+1)%100, 2, '0')
--
-- Atomicity: a single INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING statement.
--   - INSERT seeds last_number = 1 so the very first issued number for that business/FY = 001.
--   - CONFLICT path increments: last_number = last_number + 1.
--   Both the increment and the RETURNING read of the new value happen in one statement —
--   no separate SELECT, no TOCTOU gap, safe under concurrent callers.
--
-- lpad truncation fix (see 20260612120001): plain lpad(str, 3, '0') TRUNCATES when
-- length(str) > 3. Fix: lpad(str, greatest(3, length(str)), '0') — pads short numbers
-- to 3 digits but never truncates numbers >= 1000. 1 → '001', 999 → '999', 1000 → '1000'.
--
-- Security posture mirrors save_invoice_draft:
--   SECURITY INVOKER — runs as the caller, RLS enforces table-level access.
--   Membership guard — raises exception before touching invoice_sequences if the caller
--   is not a member of the target business.
--
-- Parameters:
--   p_business_id  uuid  — business whose sequence is incremented
--   p_issue_date   date  — used to derive the Indian FY string (defaults to current_date)
--
-- Returns text: formatted invoice number e.g. "INV-2025-26-001"

create or replace function public.next_invoice_number(
  p_business_id uuid,
  p_issue_date  date default current_date
)
returns text
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_prefix       text;
  v_fy_year      int;
  v_fy_string    text;
  v_last_number  int;
  v_number       text;
begin
  -- ── Membership guard ─────────────────────────────────────────────────────────
  if not exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this business';
  end if;

  -- ── Read invoice prefix from business settings ────────────────────────────────
  select invoice_prefix
    into v_prefix
    from public.businesses
   where id = p_business_id;

  if v_prefix is null then
    v_prefix := 'INV';
  end if;

  -- ── Derive Indian financial year string ───────────────────────────────────────
  -- Indian FY starts April 1. Jan/Feb/Mar belong to the FY that started the
  -- previous calendar year.
  -- e.g. 2025-04-01 → fy_year=2025 → '2025-26'
  --      2026-03-31 → fy_year=2025 → '2025-26'
  --      2026-04-01 → fy_year=2026 → '2026-27'
  v_fy_year := extract(year from p_issue_date)::int
               - case when extract(month from p_issue_date)::int <= 3 then 1 else 0 end;
  v_fy_string := v_fy_year::text || '-' || lpad(((v_fy_year + 1) % 100)::text, 2, '0');

  -- ── Atomic increment (single upsert statement) ────────────────────────────────
  -- INSERT seeds last_number = 1 so the very first issued number for this
  -- business/FY comes back as 1, which formats as '001'.
  -- ON CONFLICT increments the existing counter.
  -- Both the increment and the RETURNING read of the new value happen in one
  -- statement — no separate SELECT, no TOCTOU gap.
  insert into public.invoice_sequences (business_id, fy, last_number)
  values (p_business_id, v_fy_string, 1)
  on conflict (business_id, fy)
  do update set last_number = invoice_sequences.last_number + 1
  returning last_number into v_last_number;

  -- ── Format: {prefix}-{FY}-{NNN} ──────────────────────────────────────────────
  -- lpad(str, greatest(3, length(str)), '0') pads short numbers to 3 digits
  -- but does NOT truncate numbers >= 1000 (unlike plain lpad with a fixed width).
  -- 1 → '001', 999 → '999', 1000 → '1000', 9999 → '9999'.
  v_number := v_prefix
              || '-' || v_fy_string
              || '-' || lpad(v_last_number::text,
                             greatest(3, length(v_last_number::text)),
                             '0');

  return v_number;
end;
$$;

-- ── Grants: authenticated only ────────────────────────────────────────────────
revoke execute on function public.next_invoice_number(uuid, date) from public, anon;
grant execute on function public.next_invoice_number(uuid, date) to authenticated;
