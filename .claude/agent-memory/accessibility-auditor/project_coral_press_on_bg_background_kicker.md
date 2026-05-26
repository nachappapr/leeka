---
name: coral-press-on-bg-background-kicker
description: text-coral-press (#d9531f) on bg-background (#fbf6ef) = 3.76:1; fails 4.5:1 for small text (kicker = 11px/800wt); recurring pattern in mobile item cards
metadata:
  type: project
---

`text-coral-press` (#d9531f) on `bg-background` (#fbf6ef):
- L_coral_press ≈ 0.2106
- L_bg ≈ 0.9306
- Ratio = (0.9306+0.05)/(0.2106+0.05) = 3.76:1

The kicker semantic class = 11px / font-weight 800. Small text (< 18.67px bold / 24px normal) needs 4.5:1. 3.76:1 **fails** SC 1.4.3.

First observed on: `invoice-edit-items-mobile.tsx` — "Item 1", "Item 2" etc. badges in the mobile items editor.

**Why:** coral-press was chosen as an "accessible coral" (it passes 4.03:1 on white/bg-card), but on the warm cream background the ratio drops to 3.76:1. The gap is enough to fail.

**How to apply:** Any `text-coral-press` on `bg-background`/`bg-cream` for text smaller than 18.67px bold must be escalated to a High contrast finding. The safe fix for small text on cream is `text-coral-ink` (#5a1e08) which passes 4.5:1 easily, OR change the background of the chip to `bg-coral-soft` and use `text-coral-press` (which passes 3.40:1 for UI components but still fails for text — so `text-coral-ink` is the safer universal fix).
