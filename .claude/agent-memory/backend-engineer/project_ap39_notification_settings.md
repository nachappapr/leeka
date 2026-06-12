---
name: project-ap39-notification-settings
description: AP-39 notification_settings table — schema, RLS, Server Actions, types
metadata:
  type: project
---

## AP-39 (completed 2026-06-13)

**Table:** `public.notification_settings`
- `business_id uuid primary key references businesses(id) on delete cascade`
- `wa_delivery_receipts boolean not null default true`
- `push_invoice_viewed boolean not null default true`
- `push_payment_received boolean not null default true`
- `daily_summary_email boolean not null default false`
- `updated_at timestamptz not null default now()`

**RLS:** enabled; 5 policies mirroring reminder_rules — all using `(select auth.uid())` form (not bare `auth.uid()`) to avoid auth_rls_initplan WARNs. Anon restrictive deny.

**Migrations applied to main:**
1. `20260613110000_ap39_notification_settings.sql` — table + RLS + grants
2. `ap39_notification_settings_rls_initplan_fix` — drops and recreates all 4 tenant policies with `(select auth.uid())` form

**Types:** `src/lib/types/notification-settings.ts` — `NotificationSettingsData`, `GetNotificationSettingsResult`, `UpdateNotificationSettingsResult`

**Server Actions in `src/app/(app)/settings/actions.ts`:**
- `getNotificationSettings()` — maybeSingle read, returns hard-coded defaults when no row
- `updateNotificationSettings(payload: unknown)` — Zod `.strict()` schema of exactly 4 booleans, upsert with `onConflict: "business_id"`, sets `updated_at` explicitly on upsert so it refreshes on UPDATE (not just INSERT)

**No Pro gating** — toggles are free-tier. Pro gate applies only to auto-reminders (reminder_rules, AP-30).

**Why:** Auth_rls_initplan fix was applied in a follow-up migration because the initial migration mirrored the pre-existing pattern; the advisor flagged the new table specifically. Going forward, use `(select auth.uid())` in all new tenant RLS policies from the start.

**How to apply:** When writing tenant RLS for new single-business-id tables, always use `(select auth.uid())` in the subquery to avoid the performance advisory finding.
