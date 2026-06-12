---
name: ap16-atomic-invoice-number
description: AP-16 Unit 1 — next_invoice_number RPC, FY format, lpad truncation bug found and fixed, seeding decision
type: project
---

AP-16 Unit 1 shipped: `public.next_invoice_number(p_business_id uuid, p_issue_date date)` as SECURITY INVOKER with membership guard. Migrations: `20260612120000` (initial) and `20260612120001` (lpad fix).

AP-16 Unit 2 shipped: `public.issue_invoice(p_business_id uuid, p_invoice_id uuid)` → `jsonb { invoice_id, number, status }`. Migration: `20260612130000_ap16_issue_invoice_rpc`. Server Action: `issueInvoice(invoiceId: unknown)` appended to `src/app/(app)/invoices/actions.ts`. TypeScript types regenerated — `issue_invoice: { Args: { p_business_id: string; p_invoice_id: string }; Returns: Json }`. `data as unknown as IssueInvoiceRow` is the correct cast pattern for Json-returning RPCs (mirrors saveInvoiceDraft's `as unknown as SaveInvoiceDraftRow`).

**FY format:** `YYYY-YY` (e.g., `2025-26`). Indian FY starts April 1. Month ≤ 3 → subtract 1 from year. Two-digit suffix via `lpad((fy_year+1)%100, 2, '0')`. Confirmed matches `src/lib/constants/invoice-export.ts` label "FY 2025–26". No prior SQL helper existed.

**Seeding decision:** INSERT seeds `last_number = 1`; conflict path does `+ 1`. First call returns 1 → formats as `001`. Second call returns 2 → `002`. Correct.

**Critical bug found in initial migration:** PostgreSQL `lpad(str, n, fill)` TRUNCATES (not pads) when `length(str) > n`. `lpad('1000', 3, '0')` = `'100'` — wrong. Fix: `lpad(str, greatest(3, length(str)), '0')`. Verified: 1→'001', 999→'999', 1000→'1000', 9999→'9999'. Always use the `greatest(3, length(str))` form for NNN formatting.

**Why:** plain lpad with a fixed width silently truncates — not obvious from the PostgreSQL docs summary.

**How to apply:** whenever formatting a zero-padded sequence number in SQL with a minimum width but no maximum, use `lpad(val::text, greatest(min_width, length(val::text)), '0')` — never `lpad(val::text, min_width, '0')`.

**EXPLAIN result:** `Conflict Arbiter Indexes: invoice_sequences_pkey` — PK used, no seq scan.

**GRANT:** only `authenticated` has EXECUTE. `anon` and `public` absent from routine_privileges.

**get_advisors:** zero new findings introduced. Pre-existing WARNs are `get_public_invoice` (intentional SECURITY DEFINER per AP-9) and `create_business` (intentional per AP-6).

**invoice_sequences table RLS:** table already had RLS + 4 policies from AP-8. The SECURITY INVOKER + membership guard in the RPC is an additional layer, not a replacement.

**TypeScript type:** `next_invoice_number: { Args: { p_business_id: string; p_issue_date?: string }; Returns: string }` now in `src/lib/types/database.ts`.

**AP-16 Unit 3 — Concurrency proof (2026-06-12):** 100 genuinely parallel HTTP requests via `Promise.all` against dev PostgREST, each calling `issue_invoice` through a temporary SECURITY DEFINER harness that injected `request.jwt.claims` to satisfy the membership guard. Results: 100 successes, 0 failures, 0 duplicates, 0 gaps, tails exactly 1..100, `invoice_sequences.last_number = 100` for FY 2022-23. Harness and all seeded data cleaned up — dev returned to exact baseline. `get_advisors` clean post-run (identical pre-existing WARNs only).

**Concurrency mechanism:** fixture user `a9000000-0000-0000-0000-000000000001` exists only as a DB-level fixture (not a real Supabase Auth user, so Admin API cannot generate a token). The SECURITY DEFINER harness + service-role HTTP calls was the correct approach: 100 parallel HTTP connections → 100 concurrent transactions → genuine lock contention on one (business_id, fy) PK row in `invoice_sequences`. The ordering of assigned numbers in the first-10/last-10 sample confirms non-sequential dispatch (e.g., first 10 included 015, 010, 042, 013, proving genuine concurrency not a loop).
