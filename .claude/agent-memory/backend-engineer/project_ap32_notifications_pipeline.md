---
name: ap32-notifications-pipeline
description: AP-32 notifications-from-invoice_events pipeline — triggers, fan-out, meta column, mark-read actions
type: project
---

Migration applied to main: 20260613100000_ap32_notifications_from_events

Key decisions:
- notifications.meta jsonb NOT NULL default '{}' (not nullable — query side never needs IS NULL guard)
- emit_paid_invoice_event: AFTER UPDATE on invoices, WHEN clause + SECURITY DEFINER, search_path locked; puts invoice_number + total in event meta for downstream fan-out
- fan_out_invoice_notification: AFTER INSERT on invoice_events, WHEN type IN ('viewed','paid','reminder_sent'); SECURITY DEFINER, search_path locked; dedup guard for 'viewed' by checking notifications WHERE type='invoice_viewed' AND link=v_link
- Notification type string contract (frontend boundary): 'invoice_viewed', 'invoice_paid', 'reminder_sent'
- Index: invoice_events_business_type_created_idx ON (business_id, type, created_at DESC) — for AP-31 type-filtered feed
- Both trigger functions: REVOKE EXECUTE FROM PUBLIC, anon, authenticated

Server Actions (src/app/(app)/activity/actions.ts):
- markAllNotificationsRead: update where read=false; RLS scopes to caller's business
- markNotificationRead(id): z.string().uuid() guard before DB touch; update by id; RLS scopes
- Both use server client (cookie session), pino logger, revalidatePath('/activity'), return { ok: true } | { ok: false; error: string }
- No admin client — RLS on notifications allows tenant or self update (AP-8/AP-8001 policies already correct)

**Why:** Triggers chosen over modifying existing RPCs (record_payment, mark_invoice_paid) to avoid breaking Epic 12's concurrent work and keep the pipeline additive-only.
**How to apply:** Any future notification type additions go to fan_out_invoice_notification's CASE block + the WHEN clause on the trigger.
