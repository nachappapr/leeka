---
name: ap29-send-reminder
description: AP-29 — sendReminder Server Action, ReminderSendResult types, writeDispatchLog eventType refactor
metadata:
  type: project
---

AP-29 shipped: sendReminder Server Action for manual reminder dispatch (WhatsApp + email).

**Files changed:**
- `src/lib/types/send.ts` — added `ReminderOutcome`, `SendReminderData`, `SendReminderResult`
- `src/app/(app)/invoices/actions.ts` — refactored `writeDispatchLog` (added `eventType?` + `eventMeta?` params), added `InvoiceForReminder`, `ReminderDispatchParams`, `dispatchReminderWhatsApp`, `dispatchReminderEmail` helpers, `sendReminder` export

**Signature (hard contract with UI unit):**
```ts
sendReminder(payload: unknown): Promise<SendReminderResult>
// payload: { invoiceId: string (uuid), channel: "whatsapp" | "email" }
```

**writeDispatchLog refactor:**
- Added optional `eventType?: string` (defaults to `${channel}.dispatched` — existing callers unchanged).
- Added optional `eventMeta?: Record<string, unknown>` (spread into meta JSON — existing callers pass nothing, result is identical).
- sendReminder passes `eventType: "reminder_sent"` and `eventMeta: { source: "manual" }` — HARD CONTRACT with Epic 13's notifications trigger.

**invoice_events.type = "reminder_sent" is a hard contract.**
- Do NOT change this value. Epic 13 (AP-30+) triggers notifications on this exact string.
- Confirmed: invoice_events.type has no CHECK constraint (only NOT NULL) — any string is accepted.

**Cognitive complexity pattern:**
- sonarjs/cognitive-complexity limit is 15. sendReminder's two-branch dispatch would hit 30 if inline.
- Extracted `dispatchReminderWhatsApp` and `dispatchReminderEmail` private helpers (AP-18 pattern).

**Guards (in order):**
1. Zod: invoiceId uuid + channel enum
2. Auth: supabase.auth.getUser()
3. Membership: getBusinessId
4. Invoice fetch scoped by business_id
5. public_token present (issued guard)
6. status !== 'paid'
7. status !== 'cancelled'
8. Channel-specific: phone present (whatsapp) / email present (email)

**Env-gated outcomes:**
- WhatsApp not configured → outcome: "skipped", logError: "WhatsApp not configured"
- Email not configured → outcome: "skipped", logError: "Email not configured"
- Both return `{ ok: true, data: { ..., skipped: true } }`

**Why:** sendReminder is read-only on the invoice row — only message_log + invoice_events are written. This is intentional; status is never touched by a reminder.

**How to apply:** For future reminder/notification dispatch actions: always pass `eventType: "reminder_sent"` and `eventMeta: { source: ... }` to writeDispatchLog so Epic 13's trigger fires correctly. Auto reminders (AP-30) will pass `source: "auto"`.
