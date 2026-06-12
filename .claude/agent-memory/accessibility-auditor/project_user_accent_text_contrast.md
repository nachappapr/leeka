---
name: user-accent-text-contrast
description: User-selectable accent colours introduce systematic white-text contrast failures for 4 of 6 choices on the 11px "TOTAL DUE" label in the invoice preview — a NEW category of failure beyond the pre-existing coral deferred backlog
metadata:
  type: project
---

The `--accent` CSS variable drives `bg-(--accent)` on the TOTAL DUE row in `invoice-form-live-preview.tsx` and `invoice-preview-card.tsx`. The six accent choices and their white text ratios:

| Accent      | Hex       | Ratio | SC 1.4.3 (normal text) |
|-------------|-----------|-------|------------------------|
| Coral       | #F46A39   | 3.01  | FAIL                   |
| Teal        | #0E8F8A   | 3.95  | FAIL                   |
| Purple      | #7A4FCC   | 5.50  | PASS                   |
| Red         | #E85D5D   | 3.41  | FAIL                   |
| Green       | #1F9D55   | 3.49  | FAIL                   |
| Dark/Ink    | #1F1A14   | 17.27 | PASS                   |

The `text-11 font-extrabold uppercase` "TOTAL DUE" label is 11px and does NOT qualify as WCAG large text (needs 18.67px bold OR 24px regular), so 4.5:1 applies. 4 of 6 accents fail.

The `text-20 font-extrabold` amount (total rupee value) is 20px bold = large text → needs 3:1 → all 6 PASS.

The avatar badge `text-22 font-black` is large text → needs 3:1 → all 6 PASS.

**Why:** This is a NEW High introduced by the user-selectable template feature, distinct from the pre-existing coral deferred backlog (which is about coral on white/cream surfaces). When the user picks Coral, Teal, Red, or Green, the "TOTAL DUE" label text fails AA contrast.

**How to apply:** Flag as HIGH (SC 1.4.3). Preferred fix: restrict accent palette to only values where white passes 4.5:1 (currently only Purple #7A4FCC and Dark/Ink #1F1A14), OR replace the "TOTAL DUE" label with a larger text size (≥18.67px bold = 19px in practice), OR use a contrast-safe `color-mix` or per-accent dark ink for the label text.
