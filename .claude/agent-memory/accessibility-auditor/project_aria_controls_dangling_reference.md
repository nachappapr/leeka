---
name: project_aria_controls_dangling_reference
description: aria-controls must be undefined/absent when the target element is not in the DOM; conditional rendering creates dangling IDREFs
metadata:
  type: project
---

When a combobox (or any control) uses `aria-controls="cp-listbox"` statically, but the referenced element is conditionally rendered (`{open && <ComboboxDropdown />}`), the IDREF is dangling when the popup is closed. Some screen readers (JAWS + Firefox, NVDA) report broken references and may misannounce the combobox role.

Per APG Combobox 1.2: `aria-controls` identifies the popup element and should be absent (or `undefined`) when no popup is present in the DOM.

**Why:** Static IDs are simpler to write but create invalid ARIA when the referenced element is removed from the DOM. The AT cannot resolve the reference and some implementations degrade gracefully while others surface errors.

**How to apply:** Make `aria-controls` reactive: `aria-controls={open ? "cp-listbox" : undefined}`. This is always a no-cost change in a Client Component where `open` is already state. Note: if the popup is hidden via `display:none`/`visibility:hidden` (not DOM removal), `aria-controls` should remain set and the element should use `aria-hidden` instead.
