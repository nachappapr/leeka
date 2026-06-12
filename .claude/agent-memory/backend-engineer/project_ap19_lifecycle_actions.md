---
name: ap19-lifecycle-actions
description: AP-19 Unit 1 — mark_invoice_paid + cancel_invoice RPCs and Server Actions: status transition write path
metadata:
  type: project
---

AP-19 Unit 1 shipped: two lifecycle RPCs + two Server Actions for the mark-paid and cancel transitions.

**Migrations:**
- `20260612150000_ap19_mark_invoice_paid_rpc.sql` — `public.mark_invoice_paid(p_business_id, p_invoice_id, p_method? default 'upi')` → `jsonb { invoice_id, amount_paid, status, paid_at }`
- `20260612150001_ap19_cancel_invoice_rpc.sql` — `public.cancel_invoice(p_business_id, p_invoice_id)` → `jsonb { invoice_id, status }`

**RPC design decisions:**
- `mark_invoice_paid`: SELECT … FOR UPDATE then fresh SUM(payments) under the lock to compute outstanding. If outstanding <= 0 (drift-only), updates status/paid_at without inserting a payment row. If outstanding > 0, inserts one payment row for exactly outstanding, then recomputes SUM, then updates amount_paid + status='paid' + paid_at=now().
- `cancel_invoice`: SELECT … FOR UPDATE, checks draft/paid/cancelled guards explicitly, then UPDATE … WHERE status = v_invoice.status (guarded UPDATE mirrors issue_invoice's post-UPDATE NOT FOUND check). Does NOT touch amount_paid or payments.
- Both RPCs: SECURITY INVOKER (default), SET search_path TO 'public', 'pg_temp'.
- GRANT EXECUTE to authenticated; REVOKE from PUBLIC and anon.

**Payable / cancellable source set:** sent, viewed, partial, overdue, pending (same set as record_payment). Draft → 'not payable' / 'cannot cancel a draft (delete it instead)'. Paid → 'already paid' / 'cannot cancel a paid invoice'. Cancelled → 'already cancelled'.

**TypeScript:**
- `src/lib/schema/lifecycle.ts` — `MarkInvoicePaidSchema` (invoiceId uuid + method enum default 'upi'), `CancelInvoiceSchema` (invoiceId uuid)
- `src/lib/types/lifecycle.ts` — `MarkInvoicePaidRow`, `MarkInvoicePaidData`, `MarkInvoicePaidResult`, `CancelInvoiceRow`, `CancelInvoiceData`, `CancelInvoiceResult`
- `src/lib/types/database.ts` — `cancel_invoice` and `mark_invoice_paid` RPC entries added alphabetically
- `src/app/(app)/invoices/actions.ts` — `markInvoicePaid(payload: unknown)` + `cancelInvoice(payload: unknown)` appended; `mapMarkInvoicePaidError` and `mapCancelInvoiceError` helpers extracted (cognitive complexity pattern from AP-18)

**Cognitive complexity:** both error-mapping functions extracted as standalone helpers (5 branches each). Pattern established in AP-18: >4 error branches → extract helper.

**Concurrency proof:** Two sequential mark_invoice_paid calls proved that the second raises 'already paid' and only 1 payment row exists (total_collected = 11800). The FOR UPDATE ensures the second concurrent caller blocks until the first commits, then sees status='paid' and raises before any INSERT.

**get_advisors:** zero new findings. All pre-existing WARNs from AP-9 (get_public_invoice SECURITY DEFINER), AP-6 (create_business), and phone OTP project.

**Why:** mark_invoice_paid and cancel_invoice are atomic lifecycle transitions — all business rules (membership guard, lock, status checks, payment insert, recompute) belong in the RPC, keeping the Server Action thin.

**How to apply:** For future status-transition RPCs: (1) always FOR UPDATE the invoice before any transition, (2) check current status explicitly before the UPDATE, (3) use a guarded UPDATE (WHERE status = <prev>) and check NOT FOUND after, (4) cancel is not a refund — never touch amount_paid/payments in a cancel RPC.
