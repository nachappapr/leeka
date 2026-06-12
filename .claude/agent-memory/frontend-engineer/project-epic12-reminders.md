---
name: project-epic12-reminders
description: Epic 12 AP-29/AP-30 reminders UI — patterns, decisions, and key findings
type: project
---

AP-29 (manual reminder) and AP-30 (reminder settings) shipped 2026-06-12.

**AP-29 — reminder-channels-modal.tsx:**
- Feature-local modal in `src/components/invoices/` (NOT promoted to ui/custom — reminder is invoices-specific)
- `sendReminder({ invoiceId, channel })` called inside `useTransition` — Tier 2 pattern
- `skipped: true` from the action means credentials not configured (dev path) — shown as a `role="status"` pending-tone informational banner, NOT an error
- `failed` sends show `role="alert"` error banner with retry capability
- Render-phase reset pattern (`if (open !== prevOpen)`) copied from SendChannelsModal to avoid Base UI backdrop-stuck bug
- Invoice actions card wires: open/overdue → ReminderChannelsModal; paid/draft keep SendChannelsModal unchanged
- Mobile footer: "Remind" button opens ReminderChannelsModal (tone changed to "outline"); paid branch keeps SendChannelsModal for receipt

**AP-30 — notifications-section.tsx + reminder-settings-panel.tsx:**
- `getReminderSettings` added to `src/app/(app)/settings/actions.ts` — only export change permitted
- Load pattern mirrors `items-section.tsx`: `useEffect` + `startTransition` + set-state
- Auto-reminders toggle wired; other toggles remain mock
- Pro-gate error: "Auto reminders are a Pro feature" → reverts toggle optimistically, shows in `role="alert"` live region
- Offsets editor: change event updates local state immediately; blur fires persist (same UX as inline edits)
- max-lines-per-function ESLint rule triggered at 200 — extract sub-panels into their own file

**ESLint limits to watch:**
- `max-lines-per-function`: 200 line max — extract sub-components or helper components
- `sonarjs/cognitive-complexity`: max 15 — split conditional render branches into sub-components

**Why:** Learned ESLint cognitive-complexity and max-lines limits the hard way; extraction to reminder-settings-panel.tsx resolved both.
**How to apply:** When a component function approaches 150 lines or has deeply nested conditionals, proactively extract to a sub-component file.
