---
name: project_combobox_focus_ring_coral_soft
description: Combobox wrapper focus ring using ring-coral-soft (#ffe7da) fails SC 2.4.11; ring-coral-press is the correct token
metadata:
  type: project
---

Combobox (and any control) using `ring-coral-soft` (#ffe7da) as its focus ring against `bg-background` (#fbf6ef) achieves only 1.10:1 — catastrophically below the SC 2.4.11 minimum of 3:1. The pattern `focus-within:ring-4 focus-within:ring-coral-soft` is a recurring antipattern in the codebase (also seen in PillButton history).

The border-change companion (`focus-within:border-coral` #f46a39 vs unfocused `border-line` #ece3d4) = 2.37:1 — also fails the SC 2.4.11 focused-vs-unfocused contrast measure of 3:1.

**Why:** coral-soft (#ffe7da) was chosen for aesthetic softness but it is near-white and provides essentially no contrast against the cream background. Both the ring and the border change must independently clear 3:1 under SC 2.4.11.

**How to apply:** Replace `ring-coral-soft` with `ring-coral-press` (#d9531f) on any control's focus indicator. coral-press on bg-background = 3.75:1 (passes). Also change `border-coral` to `border-coral-press` so the border-change metric passes (coral-press vs line = 3.28:1). Apply to combobox-style wrappers that use `focus-within:ring-*` and `focus-within:border-*`.

See also: [[project_pillbutton_focus_ring]], [[project_bare_button_focus_ring]]
