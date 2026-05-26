---
name: desktop-table-inputs-no-label-no-focus
description: invoice-edit-items-table.tsx strips all focus indicators (border-0 + ring-0) from InputFields and provides no accessible name — two Critical findings confirmed in Unit B audit
metadata:
  type: project
---

`InvoiceEditItemsTable` (desktop items grid) applies `border-0 bg-transparent px-0 rounded-none shadow-none h-auto focus-visible:ring-0` to every `InputField`. This combination:
1. Negates `focus-visible:border-ring` (border-width: 0)
2. Removes `focus-visible:ring-*` entirely

Result: absolutely no visible focus indicator on any input in the desktop items table. SC 2.4.7 / 2.4.11 — Critical.

Additionally, the column headers ("Description", "Qty", "Price", "Total") are plain `<div>` elements with no `id`; the inputs carry no `aria-label`, `aria-labelledby`, or `<label>`. Screen readers announce only the field type and value with no name. SC 4.1.2 / 1.3.1 — Critical.

**Why:** The table is deliberately styled to look like an inline editing grid (no visible borders, no field chrome). The a11y contract of the inputs was stripped along with the visual chrome.

**How to apply:** Two separate fixes required:
1. Focus: add `focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-inset` (or outline variant) to override the ring-0. Inset ring works inside a borderless input without shifting layout.
2. Labels: add `aria-label` to each InputField: "Description for item {index+1}", "Quantity for item {index+1}", "Price for item {index+1}". Both are static HTML attributes; no client boundary cost (the component is already `'use client'`).
