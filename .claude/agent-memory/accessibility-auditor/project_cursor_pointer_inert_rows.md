---
name: cursor-pointer-inert-rows
description: DataRow and DataListRow ship cursor-pointer without onClick/tabIndex/key handlers — visual affordance gap is a recurring pattern in Lekka tables
metadata:
  type: project
---

Both `DataRow` (`src/components/ui/custom/data-table.tsx:65`) and `DataListRow` (`src/components/ui/custom/data-list-row.tsx:17`) apply `cursor-pointer hover:bg-coral/5` but have no `onClick`, `tabIndex`, or keyboard handlers. Interactivity is flagged as a FOLLOW-UP in the design pipeline; the rows are intentionally inert for now.

Note (audited 2026-05-26): `DataListRow` is now a proper `<li>` element (not `<div role="listitem">`), paired correctly with `<ul aria-label="Invoices">` in `InvoicesMobileList`. The semantic list structure is correct.

**Why:** When interactivity lands, the missing keyboard operability becomes Critical (SC 2.1.1) and the missing name/role/value becomes Critical (SC 4.1.2). The correct fix when rows become interactive:
- Desktop `DataRow` (renders `<tr>`): wrap cell content in a `<Link>` or use `onClick + onKeyDown + tabIndex={0} + role="button"` on the `<tr>`. APG: `<tr>` with `role="row"` is already implicit; add `tabIndex` + key handler.
- Mobile `DataListRow` (renders `<div role="listitem">`): wrap the whole `<div>` in `<Link>` (preferred — SSR-safe, no CLIENT-BOUNDARY IMPACT) OR convert to `<button>` / add `role="button" tabIndex={0} onKeyDown`.

**How to apply:** In every future audit of DataRow / DataListRow, check whether onClick has landed. If yes, immediately upgrade the cursor-pointer Medium to Critical and prescribe the full keyboard contract. If still inert, keep as Medium and note CLIENT-BOUNDARY IMPACT will apply when the fix lands.
