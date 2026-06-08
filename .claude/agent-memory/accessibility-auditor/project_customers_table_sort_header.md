---
name: customers-table-sort-header
description: customers-table.tsx puts onClick directly on DataHead (<th>) for sort — no button inside; invoices-table has the correct <button> pattern already
metadata:
  type: project
---

`customers-table.tsx` applies `onClick={header.column.getToggleSortingHandler()}` directly to `<DataHead>` (`<th>` element), which is not natively focusable or keyboard-operable. Keyboard users cannot sort.

The invoice table (`invoices-table.tsx`) already has the correct pattern: a `<button type="button">` inside each sortable `<DataHead>` with `focus-visible:ring-coral-press`.

**Fix:** Mirror the invoices-table pattern — wrap the header content in a `<button type="button">` with `onClick` and a `focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1 rounded-sm` focus style; remove `onClick` from `DataHead`.

**Why:** `<th>` elements are not keyboard-interactive; they do not receive Tab focus. Placing click handlers on them excludes keyboard users from sorting (Critical SC 2.1.1). The invoices table already solved this — customers is a regression.

**How to apply:** Any time a new TanStack Table implementation adds sorting, verify the sort handler is on a `<button>` inside `DataHead`, not on `DataHead` itself.
