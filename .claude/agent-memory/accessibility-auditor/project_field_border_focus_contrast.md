---
name: project_field_border_focus_contrast
description: focus-within:border-coral on bg-background = 2.80:1, fails SC 2.4.11 outside edge; fix is focus-within:border-coral-press (3.75:1)
metadata:
  type: project
---

Form field focus indicator uses `focus-within:border-coral` (#f46a39). The border's outer edge sits against `bg-background` (#fbf6ef).

- `border-coral` (#f46a39) vs `bg-background` (#fbf6ef) = **2.80:1 — FAILS SC 2.4.11** (needs 3:1)
- `border-coral` (#f46a39) vs `bg-surface` (#ffffff) = 3.01:1 (barely passes the inside edge only)
- `focus-within:ring-coral/14` wash = ~1.08:1 — also fails, adds no value to 2.4.11

**Why:** SC 2.4.11 requires the focus indicator to have 3:1 contrast against the adjacent non-focus-indicator colour. The outside edge of the field border is the most exposed boundary and it fails against the cream page background.

**Fix:** Replace `focus-within:border-coral` with `focus-within:border-coral-press` (#d9531f):
- vs `bg-background` = 3.75:1 ✓
- vs `bg-surface` = 4.03:1 ✓

The `ring-coral/14` wash adds no contrast value and should be replaced with `focus-within:ring-coral-press/20` or omitted.

**How to apply:** Flag any field wrapper using `focus-within:border-coral` in a form component. This pattern appears in `fieldWrapClass()` utility and the inline textarea wrapper in `business-wizard.tsx`. Related: [[project_input_textarea_focus_ring]].
