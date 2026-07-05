---
name: issue19-send-receipt
description: Issue #19 Unit 1 — sendReceipt SA, sendWhatsAppReceipt builder, isWhatsAppReceiptConfigured gate
metadata:
  type: project
---

Issue #19 Unit 1 shipped: WhatsApp receipt dispatch path (no DB migration — invoice_events.type is free-form text).

**Files changed:**
- `src/lib/env.server.ts` — added `WHATSAPP_RECEIPT_TEMPLATE_NAME` (optional, never NEXT_PUBLIC_) to schema + source; added `isWhatsAppReceiptConfigured()` checking PHONE_NUMBER_ID + ACCESS_TOKEN + RECEIPT_TEMPLATE_NAME (NOT WHATSAPP_TEMPLATE_NAME)
- `src/lib/whatsapp/send.ts` — added `WhatsAppReceiptParams` interface + `sendWhatsAppReceipt()` builder; two body params ({{1}}=amount, {{2}}=invoiceNumber), one URL button (receiptUrl, not payUrl)
- `src/lib/types/send.ts` — added `ReceiptOutcome`, `SendReceiptData`, `SendReceiptResult`
- `src/app/(app)/invoices/actions.ts` — added `InvoiceForReceipt`, `ReceiptDispatchParams`, `dispatchReceiptWhatsApp` helper, `sendReceipt` SA; imports `formatPaise` + `sendWhatsAppReceipt` + `isWhatsAppReceiptConfigured`
- `src/lib/__tests__/send-receipt-action.test.ts` — 11 tests covering all guards, skipped path, live dispatch, builder assertions

**Cognitive complexity fix:**
- `sendReceipt` extracted `dispatchReceiptWhatsApp` helper (same AP-18/AP-29 pattern) to stay under the 15-complexity limit; the extra `status !== "paid"` guard was the difference from `sendInvoice`.

**Key invariants:**
- `invoice_events.type = "receipt.dispatched"` — written via `writeDispatchLog(eventType: "receipt.dispatched")`
- Status guard: only `status === "paid"` invoices can receive a receipt
- ENV gate: `isWhatsAppReceiptConfigured()` → skipped path (logError: "WhatsApp receipt not configured")
- `WHATSAPP_RECEIPT_TEMPLATE_NAME` MUST NEVER be confused with `WHATSAPP_TEMPLATE_NAME`
- `formatPaise(invoice.total)` converts paise→₹-prefixed Indian-locale string for the template body
- Builder: two body params + URL button; no revalidateBusiness (matches sendInvoice)

**WABA template registration runbook:**
- Category: UTILITY
- Body: {{1}}=amount (e.g. "₹1,000"), {{2}}=invoiceNumber
- Button: "View Receipt" URL (NOT "Pay Now")
- Must NOT contain payment CTAs

**Why:** Honest receipt send — post-payment confirmation via a DISTINCT WABA receipt template, not the pay-link template. Units 2-5 of issue #19 handle activity label, UI button, PayPaidState, and kebab descriptor (out of scope for this unit).

**How to apply:** For future receipt-related dispatch, always check `isWhatsAppReceiptConfigured()` (never `isWhatsAppConfigured()`) and always write `eventType: "receipt.dispatched"`.
