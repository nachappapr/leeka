-- ============================================================
-- AP-38: invoice template columns on public.businesses
-- Adds accent_color + footer_message with CHECK constraints.
-- No new tables, no RLS changes — existing businesses UPDATE
-- policy covers the write path.
-- ============================================================

alter table public.businesses
  add column if not exists accent_color text not null default '#F46A39'
    check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  add column if not exists footer_message text not null default 'Thank you for your business!'
    check (char_length(footer_message) <= 120);
