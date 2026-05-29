---
name: pending-icon-contrast
description: text-pending (#c98000) on bg-pending-soft (#fff1d1) = 2.85:1; fails WCAG 1.4.11; whatsapp rail now uses bg-whatsapp-press (#006653) = 6.94:1 — RESOLVED 2026-05-30
metadata:
  type: project
---

Measured ratios (all verified against globals.css hex values):

| Pair | Ratio | Required | Result |
|------|-------|----------|--------|
| text-pending (#c98000) on bg-pending-soft (#fff1d1) | 2.85:1 | 3:1 | FAIL |
| bg-whatsapp-press (#006653) on #ffffff (rail dot on panel) | 6.94:1 | 3:1 | PASS (token updated 2026-05-30) |
| text-paid (#1f9d55) on bg-paid-soft (#e2f4e9) | 3.05:1 | 3:1 | PASS (borderline) |
| text-overdue (#c5392b) on bg-overdue-soft (#fbe3df) | 4.29:1 | 3:1 | PASS |
| text-info (#1b6fa8) on bg-info-soft (#deeef9) | 4.56:1 | 3:1 | PASS |
| text-whatsapp-icon (#178040) on bg-whatsapp-soft (#e1f9ea) | 4.51:1 | 3:1 | PASS |

The NotificationRail `whatsapp` tone was updated from `bg-whatsapp` (#25d366) to `bg-whatsapp-press` (#006653) on 2026-05-30, resolving the prior 1.98:1 failure on SC 1.4.11.

**Why:** These are icons in a colored bubble (NotificationIcon) and a decorative rail bar (NotificationRail). Both are graphical objects that convey tone/status per WCAG 1.4.11, even if aria-hidden. The rail was already using `bg-whatsapp-press` in source (notification-rail.tsx line 10); the token for that color was itself updated from #1fae54 to #006653.

**How to apply:** For pending icon, darken to text-pending-bar (#8a5700) — this has 4.83:1 on bg-pending-soft. WhatsApp rail is now resolved.
