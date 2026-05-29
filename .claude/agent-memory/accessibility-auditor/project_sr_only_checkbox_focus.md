---
name: sr-only-checkbox-focus
description: sr-only <input type=checkbox> inside a styled <label> produces no visible focus indicator; label needs focus-within:ring
metadata:
  type: project
---

`ColumnChips` (and similar patterns): the actual `<input type="checkbox">` is `sr-only` (1px, clipped, off-screen). The **native focus outline on the sr-only input is invisible** to sighted keyboard users. The styled `<label>` has no `focus-within:ring-*` class.

**Why:** `sr-only` uses `position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0)` — the focus ring is clipped and never painted in the viewport.

**How to apply:** Add `focus-within:ring-2 focus-within:ring-coral-press focus-within:ring-offset-1` (or equivalent) to the `<label>` element so that when the hidden input receives focus, the visible chip label shows the focus ring. This is pure CSS — no client boundary cost (component is already `"use client"`).

Contrast: `ring-coral-press` (#d9531f) on `bg-card` (#ffffff) = 4.03:1, passes SC 2.4.11.
