---
name: combobox-aria-expanded-hasresults
description: aria-expanded on role=combobox must reflect popup open state, NOT whether results exist
metadata:
  type: project
---

`aria-expanded` on a `role="combobox"` input reflects whether the associated popup is currently visible to the user, not whether the popup has content. Setting `aria-expanded={hasResults}` is wrong — it conflates "the listbox is open" with "the listbox has items."

**Why:** First seen in MobileSearchSheet AP-41. The desktop SearchPalette used `aria-expanded={open}` (correct). The mobile sheet used `aria-expanded={hasResults}` — this means during pending transitions, empty states, and the no-query initial state, `aria-expanded` reports `false` even though the sheet is open and content is visually displayed. Screen-reader users hear the combobox as collapsed when it is not.

**How to apply:** For inline comboboxes: `aria-expanded={open}` where open = the popup div is mounted and visible. For sheet-based comboboxes where the popup is always visible while the sheet is open, `aria-expanded` should be `true` when the listbox element is rendered, or tied to `hasResults || noQuery` (i.e., whenever there is any popup content). The simplest correct value is `true` whenever the listbox `id` exists in the DOM. If the listbox is conditionally rendered, tie `aria-expanded` to the same condition. Also: `aria-controls` must match this condition — only set when the target id is in the DOM.
