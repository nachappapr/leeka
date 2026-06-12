---
name: ap28-email-send-tracking
description: AP-28 Email send + tracking — COMPLETE; mark_email_status RPC applied to main 2026-06-12; gate evidence on file
type: project
---

Epic 11 (Email Delivery). All TypeScript shipped; migration applied to main (lnzsizporrvdzlpxysfd) 2026-06-12. Unit COMPLETE.

**Migration file:** `supabase/migrations/20260612190000_ap28_email_send_tracking.sql`
- Creates `mark_email_status(p_provider_msg_id text, p_status text)` SECURITY DEFINER
- Rank: sent=1, delivered=2, opened=3 (analogue of WhatsApp read)
- bounced = terminal — bypasses rank guard, sets status='failed', inserts notifications row for owner
- opened → invoice 'sent' → 'viewed' transition (mirror of AP-26 mark_message_status 'read')
- No new index — reuses global partial unique index `message_log_provider_msg_id_idx` (AP-26)
- GRANT service_role; REVOKE PUBLIC/anon/authenticated
- Gate evidence: Index Scan on message_log_provider_msg_id_idx confirmed; grantees = service_role + postgres only; no new advisor findings

**Key deviation from WhatsApp webhook:** Svix signature scheme (Resend), not X-Hub-Signature-256 (Meta):
- Signed content: `${svix-id}.${svix-timestamp}.${rawBody}`
- Secret: base64-decode the part after `whsec_` prefix
- svix-signature is space-separated `v1,<base64sig>` entries; verify timing-safe against each

**writeDispatchLog generalised** to take `channel: "whatsapp" | "email"` param. Existing WhatsApp call sites updated with `channel: "whatsapp"`. No breaking change.

**database.ts** manually updated to include `mark_email_status` entry in Functions (same shape as mark_message_status). Needs regeneration via `mcp__supabase__generate_typescript_types` after migration is applied on main.

**Why:** Migration can't go to a branch (branch tooling dead); must apply to main with explicit user OK.
**How to apply:** After user says "apply" — run `mcp__supabase__apply_migration` with name `ap28_email_send_tracking` and the SQL from the migration file, then regenerate types.
