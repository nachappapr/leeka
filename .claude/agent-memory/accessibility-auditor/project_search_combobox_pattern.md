---
name: search-combobox-pattern
description: SearchPalette and MobileSearchSheet APG Combobox contract gaps — role=combobox missing on input, aria-expanded absent, focus trap absent from overlay, no live region for result counts.
metadata:
  type: project
---

Both search components (SearchPalette and MobileSearchSheet) implement a combobox/search overlay but are missing key parts of the APG Combobox pattern:

1. **SearchPalette** uses `role="listbox"` on the dropdown but the `<input>` has no `role="combobox"` and no `aria-expanded`. The APG Combobox pattern requires `role="combobox"` on the input, `aria-expanded="true/false"`, `aria-haspopup="listbox"`, and `aria-activedescendant` pointing to the currently focused option. Buttons inside a listbox must not have `role="option"` — either use `role="option"` on `<li>` descendants or use a flat `<div role="option">` (not `<button role="option">`).

2. **MobileSearchSheet** is a full-screen overlay with no APG Dialog contract: no `role="dialog"`, no `aria-label`, no focus trap (Tab can escape), and no focus restore on close. The `if (!open) return null` pattern means the component is not in the DOM when closed — so `inert` is not needed — but the APG requirements for while-open are still unmet.

3. **Both** components have no `aria-live` region to announce result counts or "no results" state. Silent DOM swaps for screen-reader users.

4. Scope chips in MobileSearchSheet have no `aria-pressed` and no radiogroup pattern — see [[filter-chips-radiogroup]].

**Why:** These are the most common half-implementation patterns: adding listbox without combobox contract, adding Escape key without focus trap.

**How to apply:** Flag immediately whenever a search input opens a dropdown — check for role=combobox + aria-expanded + aria-activedescendant as a trio; any one missing is Critical.
