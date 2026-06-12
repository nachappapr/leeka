---
name: ap19-lifecycle-actions
description: AP-19 Units 1+2 — mark_invoice_paid + cancel_invoice + duplicate_invoice + delete_invoice RPCs and Server Actions
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

---

## AP-19 Unit 2 — duplicate_invoice + delete_invoice (2026-06-12)

**Migrations:**
- `20260612160000_ap19_duplicate_invoice_rpc.sql` — `public.duplicate_invoice(p_business_id, p_invoice_id)` → `jsonb { invoice_id, status: 'draft' }`
- `20260612160001_ap19_delete_invoice_rpc.sql` — `public.delete_invoice(p_business_id, p_invoice_id)` → `jsonb { invoice_id, deleted: true }`
- Two fix migrations applied: `ap19_duplicate_invoice_rpc_fix` (WHERE clause typo in apply_migration call only — file was correct), `ap19_duplicate_invoice_rpc_fix2` (invoice_line_items has no created_at/updated_at columns).

**Critical discovery: invoice_line_items has NO created_at/updated_at columns.** The table schema is: id, invoice_id, position, name, hsn_sac, qty, unit_price, discount, gst_rate, line_subtotal, line_tax, line_total, cgst, sgst, igst — nothing else. Any future RPC or migration touching invoice_line_items must NOT reference created_at/updated_at.

**Critical discovery: invoices has a BEFORE INSERT trigger `trg_invoices_set_public_token` (fn: invoices_set_public_token).** It auto-generates a fresh public_token on every INSERT regardless of what you pass. Passing NULL for public_token in duplicate_invoice is correct — the trigger replaces it with a fresh unique token (not the source's). This satisfies the "must not share the source's public token" requirement.

**FK cascade behavior (confirmed):**
- `invoice_line_items.invoice_id` → `invoices.id` ON DELETE CASCADE
- `payments.invoice_id` → `invoices.id` ON DELETE CASCADE
- `invoice_events.invoice_id` → `invoices.id` ON DELETE CASCADE
Per-spec: delete_invoice deletes children explicitly (invoice_line_items) before the invoice row — safe even if CASCADE rule changes.

**duplicate_invoice design decisions:**
- Source read: plain SELECT (no FOR UPDATE) — source invoice is only read; atomicity of new INSERT+line_items is guaranteed by the surrounding plpgsql transaction.
- Any status allowed as source — duplicating paid/cancelled/sent into a fresh draft is the intended "repeat last invoice" flow.
- Totals copied verbatim (internally consistent with copied lines); recomputation happens when user edits the clone via save_invoice_draft.
- issue_date → CURRENT_DATE; due_date → NULL (stale due date must never carry forward).
- created_by → (SELECT auth.uid()) so the clone is attributed to the duplicating user.

**delete_invoice design decisions:**
- FOR UPDATE on target invoice (mirrors cancel_invoice pattern).
- Status guard: `<> 'draft'` raises 'cannot delete a non-draft invoice (cancel it instead)'.
- Explicit child delete before invoice DELETE — belt-and-suspenders against future schema changes.

**TypeScript additions:**
- `src/lib/schema/lifecycle.ts` — DuplicateInvoiceSchema, DeleteInvoiceSchema (both single `invoiceId: z.string().uuid()`)
- `src/lib/types/lifecycle.ts` — DuplicateInvoiceRow, DuplicateInvoiceData, DuplicateInvoiceResult, DeleteInvoiceRow, DeleteInvoiceData, DeleteInvoiceResult
- `src/lib/types/database.ts` — regenerated; duplicate_invoice + delete_invoice entries added
- `src/app/(app)/invoices/actions.ts` — duplicateInvoice + deleteInvoice Server Actions appended; mapDuplicateInvoiceError + mapDeleteInvoiceError helpers extracted (AP-18 cognitive complexity pattern)

**get_advisors:** zero new findings. Same pre-existing WARNs as AP-19 Unit 1.

**GRANT:** authenticated + postgres + service_role have EXECUTE. anon/PUBLIC absent from routine_privileges.
