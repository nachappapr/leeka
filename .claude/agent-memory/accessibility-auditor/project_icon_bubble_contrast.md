---
name: project-icon-bubble-contrast
description: Verified WCAG 1.4.11 non-text contrast ratios for ActivityCard icon bubble foreground colours against their soft backgrounds
metadata:
  type: project
---

Icon bubble colour pairs verified against WCAG 1.4.11 (3:1 non-text contrast).

| Token pair | Hex pair | Ratio | Result | Notes |
|---|---|---|---|---|
| text-paid on bg-paid-soft | #1f9d55 on #e2f4e9 | 3.05:1 | borderline PASS | verified twice; stable |
| text-paid-ink on bg-paid-soft | #0f5e32 on #e2f4e9 | 6.90:1 | PASS | ink variant; used in InvoiceActivityCard |
| text-info on bg-info-soft | #1b6fa8 on #deeef9 | 4.55:1 | PASS | comfortable margin |
| text-overdue-ink on bg-overdue-soft | #6e1a11 on #fbe3df | 9.43:1 | PASS | ink variant; used in InvoiceActivityCard |
| text-draft-ink on bg-draft-soft | #3d362c on #ece5dc | 9.54:1 | PASS | ink variant; used in InvoiceActivityCard |
| text-whatsapp on bg-whatsapp-soft | #25d366 on #e1f9ea | 1.78:1 | FAIL | original failing value (never shipped) |
| text-whatsapp-press on bg-whatsapp-soft | #1fae54 on #e1f9ea | 2.62:1 | FAIL | intermediate attempt — insufficient, superseded |
| text-whatsapp-icon on bg-whatsapp-soft | #178040 on #e1f9ea | 4.51:1 | PASS | FIX LANDED & CONFIRMED — new dedicated token --color-whatsapp-icon |
| text-coral on bg-coral-soft | #f46a39 on #ffe7da | 2.54:1 | FAIL | original failing value (never shipped) |
| text-coral-press on bg-coral-soft | #d9531f on #ffe7da | 3.40:1 | PASS | fix landed, confirmed |

**Why:** bg-whatsapp-soft (#e1f9ea) is extremely light (L=0.897). To achieve 3:1, the foreground must have L ≤ 0.266. text-whatsapp-press (#1fae54) has L=0.312 — still too luminous. The fix introduces a separate icon-specific token --color-whatsapp-icon (#178040, L=0.160) which achieves 4.51:1. text-whatsapp-press (#1fae54) is retained for interactive states (not used as foreground on whatsapp-soft). Ink variants (paid-ink, overdue-ink, draft-ink) are always the safe choice for icon bubbles — their much higher luminance contrast with soft backgrounds gives 6–9:1 ratios.

**How to apply:** All icon bubble pairs now pass WCAG 1.4.11. text-paid/bg-paid-soft borderline at 3.05:1 — always verify manually if either token is adjusted; prefer text-paid-ink (6.90:1) for new bubbles. Never use text-whatsapp-press on bg-whatsapp-soft (2.62:1 — fails). The icon-only token text-whatsapp-icon exists specifically for this bubble context. The InvoiceActivityCard correctly uses ink variants throughout.
