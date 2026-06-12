---
name: ap18-record-payment
description: AP-18 — record_payment RPC + recordPayment Server Action: payments write path, atomic sum recompute, overpayment guard, concurrency lock
metadata:
  type: project
---

AP-18 shipped: `public.record_payment(p_business_id, p_invoice_id, p_amount, p_method, p_reference, p_note)` → `jsonb { invoice_id, amount_paid, status, paid_at }`. Migration: `20260612140000_ap18_record_payment_rpc.sql`.

**Schema facts:**
- payments RLS: 5 policies already in place from AP-8 (anon deny + 4 authenticated CRUD). No new policy work needed.
- payments indexes: `payments_invoice_id_idx` btree already existed from AP-8. EXPLAIN ANALYZE confirmed Bitmap Index Scan (0.089ms). No new index needed.
- profiles: columns are `id, phone (NOT NULL), display_name, language, created_at`. FK to auth.users (cannot insert without an auth user).

**RPC design decisions:**
- SELECT … FOR UPDATE on the invoice row is the concurrency lock — ensures two concurrent calls cannot both pass the overpayment guard and over-collect.
- Overpayment guard: after the FOR UPDATE, compute `v_current_paid := coalesce((SELECT SUM(amount) FROM payments WHERE invoice_id = p_invoice_id), 0)` (fresh SUM under lock), then test `(v_current_paid + p_amount) > total`. This guard is immune to any prior out-of-band drift on invoices.amount_paid. Exact-total payment is allowed (strictly-over only).
- Recompute: after INSERT, `SELECT coalesce(sum(amount),0) FROM payments WHERE invoice_id = p_invoice_id` into `v_new_paid` — always recomputes from the table, never stale arithmetic. The stored column is not used for either the guard or the final update.
- Fix-cycle note: AP-18 fix-cycle-1 replaced the stale-column guard with a fresh-SUM guard. The drift-column proof: drifted invoices.amount_paid to 90000 with zero real payments; a 20000-paise payment was accepted (fresh SUM = 0+20000 = 20000, not 90000+20000 = 110000). Migration: ap18_record_payment_guard_fresh_sum applied and on-disk file updated in place.
- Payable statuses: sent, viewed, partial, overdue, pending. draft/cancelled/paid all rejected.
- paid_at: set only on the 'paid' transition (amount_paid >= total). NOT set on partial.

**GRANT:** authenticated EXECUTE. PUBLIC and anon revoked after apply_migration (Supabase grants PUBLIC by default on new functions — always REVOKE PUBLIC, anon after GRANTing authenticated).

**TypeScript:**
- `src/lib/schema/payment.ts` — `RecordPaymentSchema` (zod), `PAYMENT_METHODS` const, `PaymentMethod` type
- `src/lib/types/payment.ts` — `RecordPaymentRow`, `RecordPaymentData`, `RecordPaymentResult`
- `src/lib/types/database.ts` — `record_payment` RPC entry added (p_reference/p_note are `string?` not `string | null` — use `undefined` not `null` in the rpc() call)
- `src/app/(app)/invoices/actions.ts` — `recordPayment(payload: unknown)` appended; `mapRecordPaymentError` helper extracted to keep cognitive complexity under 15 (sonarjs limit)

**Cognitive complexity trap:** A 7-branch if chain in the Server Action body pushed complexity to 18 (limit 15). Fixed by extracting `mapRecordPaymentError(message: unknown): string`. Keep error-mapping as a standalone helper in all future actions with > 4 error branches.

**Scripted proof result:** 6 assertions all passed in a DO block using the existing fixture user a9000000-... / business b0000000-... Cleanup complete.

**get_advisors:** zero new findings. Pre-existing WARNs only: get_public_invoice (intentional SECURITY DEFINER AP-9), create_business (intentional AP-6), auth_leaked_password_protection (phone OTP project).

**Why:** record_payment is a write-path unit — the RPC enforces all business rules atomically (membership guard, row lock, recompute, status transition) so the Server Action remains thin: validate → getBusinessId → rpc → map result.

**How to apply:** For future payment-adjacent RPCs (refunds, reversals): (1) always FOR UPDATE the invoice row before any payment mutation, (2) always recompute from SUM not +=, (3) always check payable-status before INSERT.
