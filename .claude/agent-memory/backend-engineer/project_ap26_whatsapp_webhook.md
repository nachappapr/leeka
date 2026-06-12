---
name: project-ap26-whatsapp-webhook
description: AP-26 settled decisions — WhatsApp webhook receiver, mark_message_status RPC, viewed transition
metadata:
  type: project
---

## Settled decisions from AP-26 (completed 2026-06-12)

**RPC: mark_message_status(p_provider_msg_id text, p_status text)**
- SECURITY DEFINER, GRANT to service_role only, REVOKE from PUBLIC/anon/authenticated.
- No-downgrade guard: assigns numeric rank (sent=1, delivered=2, read=3) and only UPDATEs when incoming_rank > current_rank.
- Read → viewed transition: mirrors get_public_invoice exactly — WHERE status='sent' AND viewed_at IS NULL. channel='whatsapp'.
- Returns jsonb { message_found, invoice_transitioned }.

**Index: message_log_provider_msg_id_idx**
- UNIQUE partial index WHERE provider_msg_id IS NOT NULL.
- Proven via EXPLAIN ANALYZE: Index Scan, cost 0.12..2.34.

**Env vars added to env.server.ts:**
- WHATSAPP_APP_SECRET — HMAC key for X-Hub-Signature-256 verification.
- WHATSAPP_WEBHOOK_VERIFY_TOKEN — GET challenge verification token.
- Both .optional(); isWhatsAppWebhookConfigured() helper added (mirrors isWhatsAppConfigured pattern).

**Route: src/app/api/whatsapp/webhook/route.ts**
- GET: hub.mode=subscribe + hub.verify_token match → 200 text/plain challenge; else 403.
- POST: read raw body (request.text()) BEFORE any JSON parse — required for HMAC. timingSafeEqual for sig comparison.
- When !isWhatsAppWebhookConfigured(): GET→503, POST→200 skipped (not crash).
- Always 200 to Meta after valid signature (AC8 contract). Per-status errors logged, never thrown.
- Cognitive complexity kept under 15 by extracting verifySignature() and processStatus() helpers.

**Schema: src/lib/schema/whatsapp.ts**
- MetaWebhookBodySchema — entry[].changes[].value.statuses[].
- MetaStatusSchema — id, status (enum), recipient_id, timestamp.

**Types: src/lib/types/whatsapp-webhook.ts**
- MarkMessageStatusResult { message_found, invoice_transitioned }.

**Convergence with get_public_invoice:**
- Both sources use identical WHERE clause. Whichever fires first wins; second is a no-op.
- No double invoice_events row (GET DIAGNOSTICS v_rows guard in both RPCs).

**How to apply:** Any future webhook receiver should follow the same pattern:
raw body → timingSafeEqual sig verify → Zod parse → per-item RPC calls → always 200.
