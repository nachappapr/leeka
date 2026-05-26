---
name: notification-focus-rings
description: NotificationItem inset ring-ring vs bg-surface-2 = 2.64:1; footer ghost Button focus ring on bg-background = 1.68:1 (ring/50) / 2.80:1 (border-ring); all fail WCAG 2.4.11
metadata:
  type: project
---

| Element | Focus indicator | Adjacent bg | Ratio | Required | Result |
|---------|----------------|-------------|-------|----------|--------|
| NotificationItem button | ring-ring (#f46a39) inset, at focus bg-surface-2 (#f5efe6) | bg-surface-2 | 2.64:1 | 3:1 | FAIL |
| Footer ghost Button (ring/50 outer) | rgba(#f46a39, 0.5) on bg-background (#fbf6ef) | bg-background | 1.68:1 | 3:1 | FAIL |
| Footer ghost Button (border-ring) | #f46a39 border vs bg-background (#fbf6ef) outside | bg-background | 2.80:1 | 3:1 | FAIL |
| Close button (ring-coral-press, non-inset) | #d9531f on #ffffff (popover surface) | white | 4.03:1 | 3:1 | PASS |

**Why:** WCAG 2.4.11 requires the focus indicator to have ≥ 3:1 contrast between focused and unfocused states, measured against all adjacent colors.

**How to apply:**
- NotificationItem: change `focus-visible:ring-ring` to `focus-visible:ring-coral-press` (#d9531f vs #f5efe6 = 3.97:1 — passes).
- Footer Buttons: add `focus-visible:ring-coral-press` override to override the Button primitive's global ring/50. Or add `focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1` to both Button instances in notification-panel.tsx.

See also [[project_bare_button_focus_ring]] for the recurring global outline-ring/50 pattern.
