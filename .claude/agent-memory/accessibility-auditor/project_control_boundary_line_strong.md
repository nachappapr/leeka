---
name: control-boundary-line-strong
description: border-line-strong (#d9cdb8) on bg-card (#ffffff) = 1.57:1; fails SC 1.4.11 as a control boundary; fix: border-ink-3 (5.92:1). Recurring in Cancel button and unselected channel chips.
metadata:
  type: project
---

`border-line-strong` (#d9cdb8) against `bg-card` (#ffffff) = 1.57:1 — well below the 3:1 SC 1.4.11 threshold for UI component boundaries. Seen in the Cancel button border (`border-line-strong`) and unselected channel chips in the send modal.

**Why:** SC 1.4.11 requires UI component boundaries to achieve 3:1 contrast against adjacent colors. A 1.57:1 border is effectively invisible to low-vision users and fails to communicate that the element is interactive.

**How to apply:** Replace `border-line-strong` with `border-ink-3` (#6f6253) on white/cream backgrounds for any interactive control boundary. `border-ink-3` on `bg-card` = 5.92:1. Same fix applies to `border-line` (#ece3d4) on bg-card = 1.27:1.

See also [[filter-chips-border-contrast]] for the same issue in FilterChips.
