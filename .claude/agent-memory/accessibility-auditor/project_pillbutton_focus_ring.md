---
name: pillbutton-focus-ring-contrast-fail
description: PillButton focus-visible ring uses ring-accent (#ffe7da) which has 1.09:1 contrast against bg-background (#fbf6ef) — fails WCAG 2.4.11 ≥3:1 required ratio
metadata:
  type: project
---

PillButton (`src/components/ui/custom/pill-button.tsx`) applies `focus-visible:ring-4 focus-visible:ring-accent` as its focus indicator. The `--accent` token resolves to `#ffe7da` (coral-soft).

Measured ratio: `#ffe7da` on `#fbf6ef` (bg-background) = **1.09:1** — fails WCAG 2.4.11 (≥3:1 for focus indicator contrast against adjacent colours).

**Why:** The ring colour is a pastel tint of the same cream palette as the page background — almost imperceptible.

**How to apply:** Flag on every audit where PillButton appears. Fix requires changing `ring-accent` to a token that achieves ≥3:1 against the backgrounds it appears on. Candidate: `ring-coral-press` (#d9531f) on cream backgrounds or `ring-ring` (which resolves to `--ring: #f46a39`). `ring-ring` (#f46a39) on bg-background = approx 3.01:1 — borderline; `ring-coral-press` (#d9531f) would clear 3:1 more safely. Fix is static CSS — no client boundary impact.

Related: [[coral-gradient-contrast-ratios]]
