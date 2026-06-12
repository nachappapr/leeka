---
name: project-epic9-pay-link
description: Epic 9 standing decisions — AP-22 + AP-23 approved & Notion-recorded; PDF leg parked to Epic 8/AP-21, edge-cache to AP-43; AP-24 blocked on open question #1 (gateway in v1?)
type: project
---

Epic 9 (UPI Pay Link + Public Pay Page) standing decisions, set 2026-06-12:

- AP-23 APPROVED 2026-06-12 (reworked unit: shared Card reverted, feature-local PayCard). Riders executed same day: `paiseToCurrencyStr` triplication folded into `formatPaise` in `src/lib/utils/format-currency.ts` (re-exported from utils index; gates clean, reviewer PASS); Notion AP-23 boxes checked ("Token-gated page" + "Log viewed event") with sub-bullet notes on the two parked legs; AC box left unchecked because "loads fast" depends on the parked edge-cache leg.
- AP-24 (Gateway payment links) is BLOCKED on PRD open question #1 — gateway in v1 vs manual mark-paid only. Do NOT start AP-24 until the human answers; their answer may descope it entirely.
- AP-22 approved and recorded in Notion (all 3 boxes checked). Ratified derivation: UPI `am` = amount due (`total - amount_paid`, integer paise), NOT gross total. `tn` = invoice number. Lives in `src/lib/pay/upi.ts` + `src/app/api/pay/[token]/upi/route.ts`.
- AP-23 "PDF download" checklist leg is PERMANENTLY parked until Epic 8 (AP-21) runs — human is skipping Epic 8 for now. Do NOT build PDF UI on the pay page or re-open AP-23 over its unchecked PDF box.
- AP-23 "Edge-cache for fast 3G load" leg parked to AP-43 (Epic 17 "Edge cache pay pages"): Cache Components is not enabled in next.config.ts (global change needs user approval) and `get_public_invoice` carries the viewed side-effect + live amount-due, making naive caching wrong. Surfaced to human at the AP-23 gate.
- `viewed` event logging is DB-side inside `get_public_invoice` (AP-9, migration 20260611230001) — idempotent first-view flip. Page units never need extra viewed wiring.
- REVERSED at human review (2026-06-12): the shared `Card` wrapper must NOT be changed — human verbatim: "donnot change the card design, if required create another card for the pay upi card." `src/components/ui/custom/card.tsx` reverted byte-identical to its CardPrimitive-wrapping form. The pay page instead uses feature-local `src/components/pay/pay-card.tsx` (`PayCard`: polymorphic `as`, aria-label). PayCard's non-wrapping of CardPrimitive is a USER-RATIFIED wrapper-over-primitives deviation — do not loop reviewers on it or "fix" it by re-touching the shared Card. PayCard is a promotion candidate to ui/custom only with explicit user approval.
- Coral contrast on the pay page: coral-ink on coral = 4.29:1 (fails 4.5 at 14px) — auditor's first pass miscomputed it as 10.17:1; final CTA pair is `text-ink` on `bg-coral` (5.73:1). Amount-due `text-coral` at money-sm/black passes only as large text at 3.01:1 — fragile pair, re-verify if `--color-coral` ever changes.

**Why:** human decisions at the AP-22/AP-23 gates; prevents re-opening parked legs over unchecked Notion boxes and repeats of the coral contrast trap.
**How to apply:** during Epic 9 Status Sync treat the PDF + edge-cache boxes as intentionally unchecked; when Epic 8 or AP-43 run, pick these legs up there. See [[project-ap17-issue-invoice]] for the same PDF-deferral pattern.
