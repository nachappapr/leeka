---
name: project-epic9-pay-link
description: Epic 9 CLOSED for v1 (2026-06-12) — AP-22 + AP-23 approved (commits da1862a, 75ec340); AP-24 SKIPPED for v1 per open question #1 (manual mark-paid only); PDF leg → Epic 8/AP-21, edge-cache → AP-43; coral contrast + PayCard ratifications stand
type: project
---

Epic 9 (UPI Pay Link + Public Pay Page) — **CLOSED FOR V1, 2026-06-12.** All decisions Notion-recorded (close-out note on the Epic 9 page 379aaac9a5528145b7ccc2c247da261b; §16 open question #1 marked RESOLVED on the root PRD).

- AP-22 APPROVED, committed da1862a (all 3 boxes checked). Ratified derivation: UPI `am` = amount due (`total - amount_paid`, integer paise), NOT gross total. `tn` = invoice number. Lives in `src/lib/pay/upi.ts` + `src/app/api/pay/[token]/upi/route.ts`.
- AP-23 APPROVED, committed 75ec340 (reworked unit: shared Card reverted, feature-local PayCard). Rider: `paiseToCurrencyStr` triplication folded into `formatPaise` in `src/lib/utils/format-currency.ts`. AC box + edge-cache box intentionally unchecked.
- AP-24 **SKIPPED FOR V1** — human resolved PRD §16 open question #1 on 2026-06-12: direct UPI + manual mark-paid only. Rationale: direct UPI to vendor's own VPA is zero-fee/instant; gateway adds ~2% fees + per-vendor merchant KYC onboarding; reconciliation stays manual via mark-paid/record-payment (Epic 7). Parked as post-v1 fast-follow; all AP-24 boxes intentionally unchecked with a dated SKIPPED note above them. Do NOT re-open AP-24 over its unchecked boxes during Status Sync.
- AP-23 "PDF download" leg PERMANENTLY parked until Epic 8 (AP-21) runs — human is skipping Epic 8 for now. Do NOT build PDF UI on the pay page.
- AP-23 "Edge-cache for fast 3G load" leg parked to AP-43 (Epic 17): Cache Components not enabled in next.config.ts (global change needs user approval) and `get_public_invoice` carries the viewed side-effect + live amount-due, making naive caching wrong.
- `viewed` event logging is DB-side inside `get_public_invoice` (AP-9, migration 20260611230001) — idempotent first-view flip. Page units never need extra viewed wiring.
- REVERSED at human review (2026-06-12): shared `Card` wrapper must NOT be changed — human verbatim: "donnot change the card design, if required create another card for the pay upi card." Pay page uses feature-local `src/components/pay/pay-card.tsx` (`PayCard`). PayCard's non-wrapping of CardPrimitive is a USER-RATIFIED wrapper-over-primitives deviation — do not loop reviewers on it. Promotion to ui/custom only with explicit user approval. See [[feedback-shared-ui-immutable]].
- Coral contrast traps on the pay page: coral-ink on coral = 4.29:1 (fails 4.5 at 14px); final CTA pair is `text-ink` on `bg-coral` (5.73:1). Amount-due `text-coral` at money-sm/black passes only as large text at 3.01:1 — fragile, re-verify if `--color-coral` ever changes.

**Why:** human decisions at the AP-22/AP-23 gates and the 2026-06-12 open-question-#1 resolution; prevents re-opening parked legs or AP-24 over unchecked Notion boxes.
**How to apply:** treat Epic 9 as done during Status Sync; pick up the PDF leg in Epic 8 (AP-21), edge-cache in AP-43, and AP-24 only as a post-v1 fast-follow the human explicitly re-opens. See [[project-ap17-issue-invoice]] for the same PDF-deferral pattern.
