---
name: project_active_option_fill_only_highlight
description: Listbox active-option indicated by bg-coral-soft fill alone = 1.19:1 vs card; fails SC 1.4.11; needs ring-inset accent
metadata:
  type: project
---

In a listbox/combobox dropdown, using only a `bg-coral-soft` (#ffe7da) fill to indicate the active (keyboard-highlighted) option against a `bg-card` (#ffffff) background = 1.19:1. SC 1.4.11 requires UI component states to achieve 3:1 against adjacent colours.

Screen-reader users are unaffected (aria-selected + aria-activedescendant carry the state). This is a sighted-keyboard-user failure — they cannot perceive which option has focus.

**Why:** coral-soft is near-white; the colour change is imperceptible under most lighting conditions and invisible to colour-deficient users. The fill alone is not a sufficient state indicator.

**How to apply:** Add `ring-1 ring-inset ring-coral-press` to the active-option li's className (in addition to the bg-coral-soft fill). coral-press (#d9531f) on card (#ffffff) = 4.03:1 — passes. The inset ring is appropriate here since it doesn't push layout. Alternative: `border-l-2 border-coral-press` with padding compensation. Never rely solely on a coral-soft fill change as a state indicator.

See also: [[project_coral_on_white_contrast]], [[project_sort_row_border_coral_fails]]
