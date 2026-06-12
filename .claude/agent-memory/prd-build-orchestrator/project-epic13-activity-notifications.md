---
name: project-epic13-activity-notifications
description: Epic 13 (AP-31 activity feed + AP-32 in-app notifications) CLOSED 2026-06-12 — committed 1e15515 on worktree-agent-addfbb59a954127c1, not merged
metadata:
  type: project
---

Epic 13 — Activity & Notifications is CLOSED (2026-06-12), commit `1e15515` on branch `worktree-agent-addfbb59a954127c1` (NOT pushed, NOT merged to main; user merges after Epic 12 lands).

**Why:** user pre-approved all units ("complete it and commit it"); resumed after a session-limit cutoff that had already landed the DB half.

State that matters later:
- Migration `ap32_notifications_from_events` is applied to the Supabase MAIN project as version `20260612124128` (file in repo is `supabase/migrations/20260613100000_…`). Triggers `trg_emit_paid_invoice_event` (invoices) + `trg_fan_out_invoice_notification` (invoice_events) live; `notifications.meta` column added; composite index `invoice_events(business_id, type, created_at desc)`.
- Notification type strings (frontend contract): `invoice_viewed`, `invoice_paid`, `reminder_sent`. Event types: `viewed`, `paid`, `reminder_sent` (Epic 12 produces reminder_sent).
- Topbar pattern: Topbar stays a SYNC component with a `notificationsSlot` prop; `TopbarNotifications` (async server) + `topbar-notifications-client` (60s visibility-aware poll via router.refresh, paused while panel open). Reason: `settings-container.tsx` is "use client" and imports Topbar directly — async Topbar would break it.
- Known gaps (deliberate): invoices + settings pages show NO bell (their containers are Epic 12-fenced / client; add `notificationsSlot={<TopbarNotifications />}` after merge). Per-item mark-as-read action exists (`markNotificationRead`) but is not wired to item clicks. No visible unread badge on the bell (aria-label only). `database.ts` final regeneration deferred until both epics merge.
- Poll over Supabase Realtime was the ratified choice (no client realtime infra exists).

**How to apply:** do not re-apply the AP-32 migration; do not "fix" the missing bell on invoices/settings until Epic 12 merges; treat the gaps list as the post-merge follow-up checklist.
