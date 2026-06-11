---
name: project_coral_kicker_on_bg_background
description: text-coral (#f46a39) on bg-background (#fbf6ef) = 2.80:1 — fails SC 1.4.3 at any size below 18.67px bold; fix: text-coral-ink
metadata:
  type: project
---

**Verified 2026-06-11.**

The "One more step" kicker in `business-wizard.tsx` uses `text-kicker` (11px) + `text-coral` (#f46a39) on `bg-background` (#fbf6ef).

- `#f46a39` on `#fbf6ef` = **2.80:1 — FAILS SC 1.4.3** (needs 4.5:1 at 11px, not large text)

This is a recurring pattern — the same pair previously flagged for combobox and calendar components. The coral brand colour is only safe for decorative elements; it never has sufficient contrast for informational text on the cream background.

**Fix:** `text-coral-ink` (#5a1e08) on `bg-background` = 12.93:1 ✓

**Note:** `text-coral-press` (#d9531f) on `bg-background` = 3.75:1 — also fails 4.5:1. Only `text-coral-ink` is safe for small text on light backgrounds.

**How to apply:** Any `text-coral` on `bg-background` or `bg-surface` at less than 24px normal / 18.67px bold = flag as SC 1.4.3 High. Related: [[project_coral_text_on_surfaces]], [[project_coral_press_on_bg_background_kicker]].
