---
name: project-epic12-reminders
description: Epic 12 Reminders (AP-29 manual, AP-30 auto/Pro) closed 2026-06-12; committed 7e9d31b on worktree branch agent-a161e14398a2d9541, NOT merged/pushed
type: project
---

Epic 12 — Reminders CLOSED 2026-06-12. AP-29 (manual reminder) + AP-30 (auto reminders, Pro) both shipped under standing pre-approval ("complete it and commit it"), commit `7e9d31b` on branch `worktree-agent-a161e14398a2d9541` (worktree /Users/nextdev/Projects/lekka/.claude/worktrees/agent-a161e14398a2d9541). NOT pushed, NOT merged to main — merge pending alongside Epic 13 (concurrent orchestrator, separate worktree).

Key facts:
- Migration `ap30_auto_reminders` applied to the LIVE main project as server version `20260612124214` (file in repo: `supabase/migrations/20260613000000_ap30_auto_reminders.sql`). Never re-apply; fix-forward range reserved was 20260613000001–20260613099999.
- `claim_due_reminders` RPC: SECURITY INVOKER, service_role-only EXECUTE, atomic claim via INSERT…ON CONFLICT DO NOTHING against unique expression index `invoice_events_reminder_dedup_idx (invoice_id, (meta->>'offset_days')::int) WHERE type='reminder_sent' AND meta ? 'offset_days'`. Manual reminders carry no offset_days key so they never collide.
- Hard contract with Epic 13: invoice_events type is exactly `reminder_sent`; manual meta `{source:"manual"}`, auto `{source:"auto", offset_days, due_date}`.
- Cron `/api/cron/send-reminders` at `45 19 * * *` UTC (01:15 IST) — deliberately after overdue-sweep (01:00 IST). Route writes message_log only; the RPC owns the invoice_events insert (no double-insert).
- Env-gated like Epics 10/11: live send blocked on WABA/Resend creds; skipped outcome is the expected dev path. Invoice UI still on mock data → `invoiceUuid ?? ""` pattern.
- `reminder_rules`: enabled default false, offsets_days default {0,3,7}, channel default whatsapp. Pro gate: updateReminderSettings gates only enabled=true; cron RPC re-checks plan='pro' AND enabled (defence in depth).

A11y decisions ratified in-loop:
- Channel choosers are APG radiogroups (role=radio, aria-checked, roving tabIndex, arrow keys) in BOTH reminder-channels-modal and reminder-settings-panel.
- `border-ink-3` is the shipped precedent for unselected exclusive-choice chips (status-toggle-chip, language-tile) — use it, not border-line, for new chip-style selectors.
- InputField `size="bare"` border/focus contrast stays in the user-deferred app-wide bucket — do not re-flag per-unit.

Follow-ups (parked):
- ToggleSwitch wrapper does not forward rest props → aria-describedby on the auto-reminders toggle blocked (error still announced via role=alert insert). One-line wrapper change for the next user-approved a11y pass. [[feedback-shared-ui-immutable]]
- SendChannelsModal still offers SMS that errors at send time (pre-existing debt).
- Settings has no plan display / "Upgrade to Pro" CTA near the reminders toggle.
- database.ts final regeneration deferred until Epic 12 + 13 both merge.

**Why:** session-limit resume — backend was done + migration applied before the cut; this run added the two UI units, ran reviewer + a11y (1 fix cycle), committed.
**How to apply:** when merging this branch, reconcile with Epic 13's branch (shared files: database.ts regenerated in both; vercel.json possibly). Status Sync for any reminders follow-up starts from commit 7e9d31b.
