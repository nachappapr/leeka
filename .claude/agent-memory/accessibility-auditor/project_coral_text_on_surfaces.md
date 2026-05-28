---
name: coral-text-on-surfaces
description: coral (#f46a39) as text color on white/cream surfaces — confirmed contrast ratios and safe alternatives for all text sizes
metadata:
  type: project
---

Verified ratios for coral text (#f46a39):
- On bg-surface (#ffffff): 3.01:1 — FAILS 4.5:1 (normal text <18.67px non-bold); barely passes 3:1 (large text)
- On bg-cream (#fbf6ef): 2.80:1 — FAILS 3:1; fails for all text sizes including large

coral-press (#d9531f):
- On bg-surface: 4.03:1 — passes 3:1 (large) but still fails 4.5:1 (normal text)
- On bg-cream: 3.75:1 — passes 3:1 (large) but fails 4.5:1

coral-deep (#e94a1f):
- On bg-surface: 3.84:1 — fails 4.5:1

coral-ink (#5a1e08):
- On bg-surface: 12.93:1 — PASSES all sizes

**Safe rule:** coral (#f46a39) text is ONLY safe for large text (>=18.67px non-bold or >=14px bold) on white surfaces. For any normal text using coral color as a standalone text color (Cancel button, Clear button, action labels), must use coral-ink (#5a1e08) or ink-2 (#5b5042) instead, or accept that the component uses coral only as a brand accent for large text.

**First seen:** Cancel button in MobileSearchSheet (text-coral, text-body 16px, on bg-surface = 3.01:1 FAIL). Clear recents button (text-coral, text-label 12px, on bg-cream = 2.80:1 FAIL).

**How to apply:** Whenever text-coral is used for body/label/kicker text on light backgrounds, flag immediately. coral-ink is the safe dark-coral alternative.
