---
name: project-epic10-whatsapp
description: Epic 10 WhatsApp Delivery — AP-25 built env-gated (no live creds yet); status/PDF/webhook de-scoped; AP-26/27 pending
type: project
---

Epic 10 (WhatsApp Delivery), AP-25 "Cloud API send" implemented & gated 2026-06-12, awaiting human review (not yet committed).

**Three binding decisions (relayed from human review, 2026-06-12):**
1. **Env-gated build.** No Meta WABA/template/token exists. The full Cloud API send path is built against the contract, but the live POST is gated behind `WHATSAPP_*` env presence (all optional in `src/lib/env.server.ts`; `isWhatsAppConfigured()` helper). When unconfigured, `sendInvoice` SKIPS the live call, writes a `message_log` row `status='skipped'` + `invoice_events`, and returns `{ ok:true, data:{ skipped:true } }` — never throws. Mirrors AP-4 test-OTP precedent. Live-delivery verification deferred.
2. **Status transition de-scoped from AP-25.** `sendInvoice` records DISPATCH ONLY (message_log + invoice_events + provider_msg_id). It does NOT touch `invoices.status` or `sent_at` — those are owned by AP-16/AP-17's `issue_invoice`. No issue-and-send folding.
3. **Template = pay-link only.** Text/CTA template carrying the pay link. NO PDF document header. PDF parked to Epic 8 (consistent with AP-17/AP-23 deferrals).

**Files:** `sendInvoice` in `src/app/(app)/invoices/actions.ts`; Cloud API helper `src/lib/whatsapp/send.ts`; `SendInvoiceResult` in `src/lib/types/send.ts` (SendState also gained `"failed"`); env extended with `WHATSAPP_PHONE_NUMBER_ID/ACCESS_TOKEN/TEMPLATE_NAME/API_VERSION` + `NEXT_PUBLIC_APP_URL` (all optional). Modal `send-channels-modal.tsx` wired to the action via `useTransition` with failure/retry UI; `invoiceUuid` prop threaded to 5 call sites.

**KNOWN TRANSITIONAL LIMITATION:** invoices list + detail still render from MOCK constants (`src/lib/constants/invoices.ts`), so `Invoice.invoiceUuid` is `""` at all 5 call sites. A send from a mock row returns `{ok:false,"Invalid invoice ID"}` (graceful failure UI). Real end-to-end send is NOT reachable from the UI until the invoices list/detail are switched to LIVE Supabase data — `Invoice.invoiceUuid` is the documented hook-point for that wiring pass.

**Why:** Unblocks the WhatsApp send path now without a Meta account, and keeps lifecycle ownership clean (AP-16/17 own status).
**How to apply:** Do NOT re-open AP-25 to add status mutation, PDF, or live-send verification — all intentionally deferred. AP-26 (delivery/read webhook → viewed) and AP-27 (onboarding docs) are still open in Epic 10. Before claiming WhatsApp works end-to-end, confirm (a) WHATSAPP_* env is set, (b) the WABA template is registered, and (c) invoices are on live data so invoiceUuid is populated.
