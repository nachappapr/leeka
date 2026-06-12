---
name: project-ap16-invoice-numbering
description: Epic 6 AP-16 atomic invoice numbering — CLOSED 2026-06-12, all 3 units approved, story-completion gate passed, committed as 075ef3f
metadata:
  type: project
---

**STORY CLOSED 2026-06-12.** All 3 units human-approved; story-completion gate passed (pure-backend scope — UI close-out items n/a). Committed as `075ef3f`. Working tree clean. Live DB verified: invoice_sequences PK (business_id, fy); next_invoice_number + issue_invoice both SECURITY INVOKER, search_path pinned (public, pg_temp), EXECUTE→authenticated; advisors carry zero AP-16 findings (the 3 SECURITY DEFINER WARNs are pre-existing get_public_invoice/create_business + auth password setting, not regressions); concurrency harness fully removed (none-clean). All 6 SQL files on disk (3 real migrations 20260612120000/120001/130000 + 3 stub harness SQLs for phantom remote history). 46 vitest tests pass.

**Why:** Gap-free, dupe-free sequential numbering is a P0 legal/compliance requirement for Indian GST invoices.

**How to apply:** AP-16 is DONE — do not re-open or re-verify on resume. Next Epic 6 work (if any) or the next PRD story begins fresh. Carried follow-ups below remain parked.

Epic 6 (Milestone M1) · AP-16 "Atomic invoice numbering" — race-safe, gap-free per-business per-FY invoice numbers. 3 units, section-level review gate.

**Why:** Gap-free, dupe-free sequential numbering is a P0 legal/compliance requirement for Indian GST invoices; a burned or duplicated number is a real-world defect.

**How to apply:** When resuming Epic 6, derive position from PRD checkboxes + this memory; never store live loop state. FY format is `YYYY-YY` (e.g. `2025-26`), confirmed by the human 2026-06-12 — do not re-litigate.

Unit status (as of 2026-06-12):
- **Unit 1 — APPROVED (human, 2026-06-12), live on dev.** RPC `next_invoice_number(p_business_id uuid, p_issue_date date)`; single-statement atomic upsert on invoice_sequences PK (business_id, fy); returns `{prefix}-{FY}-{NNN}` e.g. `INV-2025-26-001`; SECURITY INVOKER, pinned search_path, membership-guarded, EXECUTE→authenticated. Migrations `20260612070419` + `20260612070602` (second forward-fixes an lpad truncation bug — it's the live definition).
- **Unit 2 — APPROVED (human, 2026-06-12), live on dev.** RPC `issue_invoice(p_business_id uuid, p_invoice_id uuid)` migration `20260612130000_ap16_issue_invoice_rpc`; transitions draft→sent, draws number via next_invoice_number(business, invoice.issue_date), sets sent_at/updated_at, all in one plpgsql body. Double-issue guard fires BEFORE the sequence draw; TOCTOU `AND status='draft'` + NOT FOUND safeguard on the UPDATE. Server Action `issueInvoice(invoiceId)` in `src/app/(app)/invoices/actions.ts`. Evidence proven: happy-path number assigned, double-issue rejected with last_number unchanged, atomicity rollback verified, advisors clean. Reviewer PASS. a11y n/a (pure backend).
- **Unit 3 — REVIEW-READY (returned for human review 2026-06-12).** Load test PROVEN on dev: 100 parallel Promise.all HTTP→PostgREST txns contending on one (b0000000-…0001, FY 2022-23) invoice_sequences row → exactly 001…100, COUNT(DISTINCT)=100, generate_series anti-join missing=0, sent_count=100 / draft_remaining=0, last_number=100. Mechanism Option A: temp SECURITY DEFINER harness injected jwt.claims to satisfy the SECURITY INVOKER membership guard (real fixture user a9000000-…0001 has no Auth identity, so Option B vitest+JWT was blocked). Harness + 100 fixtures + FY-2022-23 seq row all DROPPED/deleted; reviewer re-verified gone by live query, advisors clean, fence intact, zero Unit-3 repo files. Reviewer FAIL was a process flag NOT a Unit-3 defect → see close-out blocker below.

**EPIC CLOSE-OUT BLOCKER (surfaced 2026-06-12, owned by human gate):** AP-16 Units 1 & 2 production artefacts are UNCOMMITTED in the working tree — `src/app/(app)/invoices/actions.ts` (issueInvoice action, modified), `src/lib/types/database.ts` (regenerated), and 3 untracked migration SQL files (`20260612120000`, `20260612120001`, `20260612130000`). The issueInvoice Server Action exists ONLY in the working tree; a git stash/branch switch destroys it. Must be committed before the AP-16 story is declared done. This is the only outstanding item — Unit 3's own work is clean.

Carried follow-ups (parked across the epic, do NOT build unless a unit naturally subsumes):
- Prefix read outside the atomic upsert in next_invoice_number (benign stale-prefix window).
- Pre-existing missing covering index on `invoices_customer_id_fkey` (AP-8 INFO advisor) — wants its own index migration.
- `invoice_events` audit row on issue — schema supports it; AP-13/14 set precedent of not logging events on write actions; deferred to a future audit unit.
- UI "Issue" button wiring — issueInvoice is ready to call; future frontend unit.
