---
name: project-ap15-live-preview-parity
description: AP-15 Live preview parity — CLOSED 2026-06-12, both units approved (preview GST-split read; preview-vs-persisted reconciliation); PDF + pay-page parity legs deferred to their own epics
metadata:
  type: project
---

**AP-15 (Epic 5 — Live preview parity) is CLOSED as of 2026-06-12 — both units human-approved.** AP-15 drives the invoice preview off the server-side cgst/sgst/igst/round_off totals that AP-14 persists, and owns the cross-surface "figures match" verification.

**Parity AC recorded as:** preview == persisted totals verified in-app; the PDF and pay-page legs of the original cross-surface "figures match across preview/PDF/pay-page" criterion are **deferred to their own epics** (PDF rendering epic, pay-page epic) — not silently dropped, explicitly parked because those surfaces don't exist yet.

**Unit 1 — APPROVED 2026-06-12.** (Preview GST-split read.) Preview surface reads the persisted server-side split rather than recomputing client-side.

**Unit 2 ("Preview GST-split display + post-save reconciliation") — APPROVED 2026-06-12 ("approved, fix the follow-ups, commit and update notion"), closing AP-15.** Includes the any-fix Task A delivered with it. The main conversation (NOT this orchestrator) is handling: the two approved follow-ups (reconciliation helper extraction + dead-branch removal, user-authorized, gated by frontend-engineer + reviewer), the git commit, and the Notion checkbox updates.

**How to apply (next invocation):** Status Sync reports AP-15 closed. Epic 5's AP-13/AP-14/AP-15 invoice-draft + GST + preview chain is complete. The next story is whatever follows AP-15 in the PRD (Epic 5 tail or Epic 6) — derive it from the PRD section the user hands over; do not assume from memory. The AP-15 commit + Notion updates were handled by the main conversation, not this orchestrator.
