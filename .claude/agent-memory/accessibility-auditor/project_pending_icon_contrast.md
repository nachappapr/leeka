---
name: pending-icon-contrast
description: text-pending (#c98000) on bg-pending-soft (#fff1d1) = 2.85:1; fails WCAG 1.4.11 (graphical objects need 3:1); bg-whatsapp rail (#25d366) on white = 1.98:1 also fails
metadata:
  type: project
---

Measured ratios (all verified against globals.css hex values):

| Pair | Ratio | Required | Result |
|------|-------|----------|--------|
| text-pending (#c98000) on bg-pending-soft (#fff1d1) | 2.85:1 | 3:1 | FAIL |
| bg-whatsapp (#25d366) on #ffffff (rail on panel) | 1.98:1 | 3:1 | FAIL |
| text-paid (#1f9d55) on bg-paid-soft (#e2f4e9) | 3.05:1 | 3:1 | PASS (borderline) |
| text-overdue (#c5392b) on bg-overdue-soft (#fbe3df) | 4.29:1 | 3:1 | PASS |
| text-info (#1b6fa8) on bg-info-soft (#deeef9) | 4.56:1 | 3:1 | PASS |
| text-whatsapp-icon (#178040) on bg-whatsapp-soft (#e1f9ea) | 4.51:1 | 3:1 | PASS |

**Why:** These are icons in a colored bubble (NotificationIcon) and a decorative rail bar (NotificationRail). Both are graphical objects that convey tone/status per WCAG 1.4.11, even if aria-hidden.

**How to apply:** For pending icon, darken to text-pending-bar (#8a5700) — this has 4.83:1 on bg-pending-soft. For whatsapp rail, darken to bg-whatsapp-press (#1fae54) = 3.38:1 on white, or use bg-whatsapp-icon (#178040) = ~5.4:1.

Note: the NotificationRail comment in source says bg-whatsapp is intentional for brand reading — but brand aesthetics do not override WCAG 1.4.11.
