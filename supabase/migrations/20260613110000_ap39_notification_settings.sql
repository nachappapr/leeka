-- AP-39: notification_settings table
--
-- Persists the four per-business notification channel toggles:
--   wa_delivery_receipts   — WhatsApp delivery receipts
--   push_invoice_viewed    — Push notification when an invoice is viewed
--   push_payment_received  — Push notification when payment is received
--   daily_summary_email    — Daily summary email
--
-- Defaults mirror SETTINGS_NOTIFICATION_TOGGLES.defaultOn values:
--   wa_delivery_receipts   = true
--   push_invoice_viewed    = true
--   push_payment_received  = true
--   daily_summary_email    = false
--
-- Design: one row per business (business_id is the primary key).
-- The row is created on first save via upsert (onConflict: "business_id").
-- No row = use defaults (handled in the Server Action).
--
-- No Pro gating on these toggles. The Pro gate applies only to auto-reminders
-- (reminder_rules, AP-30) which are a separate concern.
--
-- RLS: mirrors reminder_rules — authenticated members only, anon restrictive deny.

create table public.notification_settings (
  business_id           uuid        primary key references public.businesses(id) on delete cascade,
  wa_delivery_receipts  boolean     not null default true,
  push_invoice_viewed   boolean     not null default true,
  push_payment_received boolean     not null default true,
  daily_summary_email   boolean     not null default false,
  updated_at            timestamptz not null default now()
);

-- RLS
alter table public.notification_settings enable row level security;

create policy "tenant: owner read"   on public.notification_settings for select to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner insert" on public.notification_settings for insert to authenticated
  with check ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner update" on public.notification_settings for update to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "tenant: owner delete" on public.notification_settings for delete to authenticated
  using   ( business_id in (select business_id from public.business_members where user_id = (select auth.uid())) );
create policy "anon deny" on public.notification_settings as restrictive to anon using (false);

-- Grants
grant select, insert, update, delete on public.notification_settings to authenticated;
revoke select, insert, update, delete, truncate, trigger, references on public.notification_settings from anon;
