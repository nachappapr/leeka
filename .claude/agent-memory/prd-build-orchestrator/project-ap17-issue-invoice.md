---
name: project-ap17-issue-invoice
description: AP-17 (Epic 7 Issue invoice) closed 2026-06-12 against AP-16's shipped issue_invoice RPC; PDF half of AC deferred to AP-21
metadata:
  type: project
---

AP-17 (Epic 7 — Issue invoice) is CLOSED as of 2026-06-12. It was satisfied by what AP-16 (Epic 6) already shipped: the `issue_invoice` RPC (draft → assign number → status 'sent', double-issue guard via status<>'draft' OR number IS NOT NULL = idempotency) plus the `issueInvoice` Server Action at `src/app/(app)/invoices/actions.ts`.

The PRD AC for AP-17 reads "issued invoice has number + PDF". The PDF half was explicitly DEFERRED to AP-21 (Epic 8, branded multilingual PDF) — human decision (Option A) relayed 2026-06-12.

**Why:** The issue/numbering machinery was fully delivered in AP-16; only PDF generation remained, and PDF is a whole Epic-8 surface. Splitting PDF out of AP-17 avoids pulling Epic 8 scope into Epic 7.
**How to apply:** Treat AP-17 as done — do NOT re-dispatch it. When AP-21 is reached, its AC must close the "issued invoice has PDF" loop (this is the deferred obligation). The PRD Notion checkbox for AP-17 still literally says "generate PDF" — that is stale vs this decision; the relayed approval governs, do not re-open AP-17 over the checkbox text.
