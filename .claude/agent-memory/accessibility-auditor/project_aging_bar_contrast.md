---
name: project-aging-bar-contrast
description: Verified WCAG 1.4.11 non-text contrast for MoneyAwaitedCard aging-bar fill colours against bg-surface-2 track
metadata:
  type: project
---

Aging bar fill vs bg-surface-2 (#f5efe6) — verified WCAG 1.4.11 (3:1):

| Token | Hex | Ratio | Result | Notes |
|---|---|---|---|---|
| bg-paid | #1f9d55 | 3.06:1 | borderline PASS | token unchanged |
| bg-pending (original) | #c98000 | 2.81:1 | FAIL | original failing value |
| bg-pending-bar (fix) | #8a5700 | 5.33:1 | PASS | new sibling token; fix confirmed |
| bg-overdue | #c5392b | 4.60:1 | PASS | unchanged |

**Why:** bg-pending (#c98000) was too close in luminance to the warm cream track. The fix added bg-pending-bar (#8a5700) as a darker sibling token for bar fill use only; bg-pending is retained for other uses (status pills use pending-soft/pending-ink, not bg-pending directly). bg-pending-bar at 5.33:1 gives a strong margin.

**How to apply:** MoneyAwaitedCard TONE_CLASS.pending now correctly uses bg-pending-bar. When auditing any new bar/progress component using pending tone, use bg-pending-bar not bg-pending. bg-paid on surface-2 is borderline — note on every pass.
