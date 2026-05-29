---
name: border-line-control-boundary
description: border-line (#ece3d4) on white/surface (#ffffff) = 1.25:1; fails SC 1.4.11 when used as the sole boundary of an interactive control on a same-colour background
metadata:
  type: project
---

`border-line` (#ece3d4) on `bg-surface` / `bg-card` (#ffffff) = **1.25:1** — fails SC 1.4.11 (3:1 minimum for UI component boundaries).

This matters when the border is the **only visual boundary** separating the control from its background. If the control also contains a clearly visible icon or text glyph at ≥3:1 that defines the interactive area, WCAG allows the boundary colour to fail — but only when the glyph alone unambiguously demarcates the control's boundary. For a small 34×34 icon button, the glyph does not span the full perimeter, so the border remains the primary boundary affordance and the failure stands.

**Why:** Verified on the sidebar logout button (sidebar.tsx:204): bg-surface (#ffffff) button on sidebar (#ffffff) background, 1px border-line sole boundary → 1.25:1.

**How to apply:** Any icon-button, select, or input that uses `border-line` on a `bg-surface` or `bg-card` parent must upgrade to at least `border-line-strong` (#d9cdb8 on #ffffff = ~1.56:1, still fails) or `border-ink-3` (#6f6253 on #ffffff = 5.95:1, passes). The safe fix is `border-ink-3`. Alternatively, if the button has a non-white background that provides a 3:1 contrast difference against the parent, the border contrast requirement is met through the fill instead.
