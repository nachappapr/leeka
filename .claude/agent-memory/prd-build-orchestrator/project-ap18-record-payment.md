---
name: project-ap18-record-payment
description: AP-18 record payment — CLOSED, approved & committed fd53fac 2026-06-12; overpayment hard-reject deviation ratified
metadata:
  type: project
---

AP-18 (Record payment, Epic 7) is CLOSED — approved and committed as fd53fac on 2026-06-12: "feat: Epic 7 AP-18 — record payment: locked SUM overpayment guard, partial/paid recompute, RPC + Server Action".

**Why:** Builds the record_payment RPC + Server Action that AP-19's mark-paid leg reuses (full payment = record_payment for the full outstanding balance, then status → paid).

**How to apply:** When AP-19 mark-paid is implemented, expect it to call the existing record_payment RPC rather than a new payment-insert path. The overpayment guard deviation is ratified: a payment strictly OVER the invoice total is hard-rejected; a payment EXACTLY equal to the outstanding total is allowed. Do not re-litigate this deviation.
