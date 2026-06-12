---
name: mobile-listbox-button-option
description: button elements inside role=listbox are invalid ARIA ownership; must use role=option on a non-interactive element or div
metadata:
  type: project
---

`<button>` inside `role="listbox"` violates ARIA owned-element spec. `role="listbox"` must own `role="option"` or `role="group"` (containing `role="option"`) children only. A `<button>` inside a listbox causes AT to discard listbox ownership semantics, leaving both the listbox grouping and the button name/role broken.

**Why:** First seen in MobileSearchSheet AP-41 — desktop used `<div role="option">` correctly; mobile used `<button>` for each result row, then wrapped them in `role="listbox"`.

**How to apply:** When result rows inside a `role="listbox"` are `<button>` elements, this is always Critical (WCAG 4.1.2 + APG Combobox). Fix: change each result row to `<div role="option" tabIndex={-1} aria-selected={...}>` with `onClick` + `onKeyDown` (Enter/Space) handlers. The surrounding `role="listbox"` onClick/keyboard delegation pattern is the correct APG approach.
