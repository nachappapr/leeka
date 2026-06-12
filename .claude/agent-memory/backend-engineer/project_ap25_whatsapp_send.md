---
name: project-ap25-whatsapp-send
description: AP-25 settled decisions — WhatsApp Cloud API dispatch, env-gate pattern, sendInvoice action structure
metadata:
  type: project
---

## Settled decisions from AP-25 (completed 2026-06-12)

**Three binding user decisions (not re-litigatable):**
1. ENV-GATED BUILD: live POST only when WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN + WHATSAPP_TEMPLATE_NAME are all set. When absent → write 'skipped' message_log row + return { ok:true, data:{ skipped:true } }.
2. STATUS TRANSITION DE-SCOPED: sendInvoice MUST NOT touch invoices.status or invoices.sent_at. Those are owned by issue_invoice (AP-16).
3. TEMPLATE = PAY-LINK ONLY: text/CTA template, no PDF document header (Epic 8 deferred).

**New files:**
- `src/lib/whatsapp/send.ts` — pure sendWhatsAppInvoice() helper. Builds template payload (body var = invoiceNumber, button URL var = payUrl). POST to graph.facebook.com/{version}/{phoneNumberId}/messages. Returns { ok:true; providerMsgId } | { ok:false; error }. No PII/secrets in logs.
- WhatsApp API version default: "v21.0" (WHATSAPP_API_VERSION optional, falls back to "v21.0").

**env.server.ts additions:**
- NEXT_PUBLIC_APP_URL: z.url().optional() — also added to server schema (already existed in client schema). Used for pay link construction server-side.
- WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_TEMPLATE_NAME, WHATSAPP_API_VERSION — all .optional().
- isWhatsAppConfigured() exported helper: checks all three required vars.

**Pay URL construction:**
- Prefer NEXT_PUBLIC_APP_URL; fall back to NEXT_PUBLIC_SUPABASE_URL in dev.
- Pattern: `${appBase}/pay/${invoice.public_token}`
- Documented in comment: in dev without APP_URL the fallback URL points at Supabase — set NEXT_PUBLIC_APP_URL in .env.local for correct links.

**sendInvoice action (actions.ts) structure:**
- Input: invoiceId UUID (not display number — UI must pass the UUID).
- Auth + businessId guard (same pattern as all other actions).
- Fetch invoice by UUID scoped to businessId via RLS user client (join customers(phone)).
- Guards: public_token must exist (invoice must be issued); customer phone must not be null.
- writeDispatchLog() private helper: writes message_log + invoice_events. Extracted to keep sendInvoice under sonarjs/cognitive-complexity limit of 15.
- Event type: 'whatsapp.dispatched' (consistent across all outcomes). Channel: 'whatsapp'.
- meta jsonb: { outcome, provider_msg_id } — no phone, no token (no PII).

**message_log status values used:**
- 'skipped' — env gate not configured
- 'sent' — live API success
- 'failed' — live API error

**Types added:**
- WhatsAppOutcome = "sent" | "failed" | "skipped" in src/lib/types/send.ts
- SendInvoiceData { invoiceId, messageLogId, outcome, skipped? } in src/lib/types/send.ts
- SendInvoiceResult = { ok:true; data: SendInvoiceData } | { ok:false; error } in src/lib/types/send.ts

**Supabase MCP evidence:**
- message_log INSERT: all 3 status values accepted. policy: WITH CHECK business_id in (select business_members...) with (select auth.uid()).
- invoice_events INSERT: whatsapp.dispatched type + jsonb meta accepted.
- anon deny: RESTRICTIVE policy qual=false on both tables.
- get_advisors: no new Critical/High/WARN. All findings pre-existing from prior epics.

**Why isWhatsAppConfigured() vs env-level required:**
This mirrors the AP-4 test-OTP precedent — the server starts without credentials;
the gate is at call-time not parse-time. Matches the "graceful unconfigured path"
user requirement.

**How to apply:** Future messaging channels (SMS, email) should follow the same
pattern: optional env vars + isXxxConfigured() helper + 'skipped' log row.
