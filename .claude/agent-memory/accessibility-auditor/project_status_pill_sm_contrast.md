---
name: status-pill-sm-contrast
description: StatusPill size=sm uses text-kicker (11px) — all five status ink/soft pairs verified to pass 4.5:1 at this size
metadata:
  type: project
---

StatusPill `size="sm"` renders at `text-kicker` (11px). All five status ink-on-soft pairs verified with WCAG relative luminance formula:

| Status | ink token | soft token | ink hex | soft hex | ratio |
|--------|-----------|------------|---------|----------|-------|
| draft  | draft-ink | draft-soft | #3d362c | #ece5dc  | 9.54:1 PASS |
| pending / partial | pending-ink | pending-soft | #6e4500 | #fff1d1 | 7.46:1 PASS |
| overdue | overdue-ink | overdue-soft | #6e1a11 | #fbe3df | 9.43:1 PASS |
| paid    | paid-ink   | paid-soft   | #0f5e32 | #e2f4e9 | 6.88:1 PASS |
| sent / viewed | info (#1b6fa8) | info-soft (#deeef9) | — | — | 4.56:1 PASS (marginal) |

All pass 4.5:1 (SC 1.4.3). The `info`/`info-soft` pair is the tightest at 4.56:1 — safe but worth re-checking if either token changes.

Color is not the only signal: pills include a leading dot (`before:` pseudo-element) and visible text label, satisfying SC 1.4.1.

**Why:** 11px is well below the large-text threshold (18pt / 24px or 14pt bold / 18.67px), so the 4.5:1 normal-text threshold applies — not 3:1. Verified after size=sm variant introduced in this diff.

**How to apply:** When a new status token pair is added, compute both ratio directions. The info pair (4.56:1) is the floor — any new pair must clear 4.5:1 on its soft background.
