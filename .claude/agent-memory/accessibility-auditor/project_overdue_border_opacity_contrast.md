---
name: overdue-border-opacity-contrast
description: RESOLVED 2026-06-08 — border-overdue/30 and /55 fail SC 1.4.11; CustomerFormDeleteButton now uses solid border-overdue (5.26:1); rule still applies project-wide
metadata:
  type: project
---

RESOLVED in CustomerFormDeleteButton. Solid `border-overdue` (#c5392b) now used throughout.

Verified ratios on bg-card (#ffffff):
- border-overdue: 5.26:1 — PASSES SC 1.4.11
- border-overdue on bg-background (#fbf6ef): 4.89:1 — PASSES
- border-overdue on hover bg (overdue-soft/40 blend ≈ #fdf4f2): 4.86:1 — PASSES
- ring-overdue focus ring on bg-card: 5.26:1 — PASSES SC 2.4.11
- text-overdue on bg-card: 5.26:1 — PASSES SC 1.4.3

Prior violations (now fixed):
- border-overdue/30 composited over #fff = #eec4bf = 1.58:1 — FAILED
- border-overdue/55 = #df928a = 2.44:1 — FAILED

**Why:** Opacity modifiers on border colours dilute towards the background and almost always fail the 3:1 UI component boundary threshold. The overdue red is warm-muted enough that even /55 falls short.

**How to apply:** Never use border-overdue/* with an opacity modifier as the sole visual boundary of an interactive control. Use the solid token. If a lighter treatment is needed, bg-overdue-soft as fill + solid border-overdue is safe (solid border = 5.26:1 on card). This rule applies project-wide — any new component using border-overdue/N should be flagged.
