---
name: chip-group-labelling
description: Chip groups (Date range, Status, Column) use a <div> FieldLabel with no programmatic association to the chip group container
metadata:
  type: project
---

`FieldLabel` in `ExportInvoicesModal` renders as a `<div>` — it is not a `<legend>` and not linked via `aria-labelledby` to the chip-group container. Screen readers cannot associate "Status" or "Date range" labels with the corresponding button groups.

**Why:** SC 1.3.1 requires groups of related controls to have a programmatic label. Without `role=group` + `aria-labelledby` (or `<fieldset>` + `<legend>`), AT users hear isolated button names without knowing they belong to a "Status" filter group.

**How to apply:** 
1. Add a unique `id` to each `FieldLabel` (e.g. `id="export-date-label"`)
2. Wrap the chip group `<div>` in `role="group" aria-labelledby="export-date-label"`
3. OR restructure as `<fieldset>` + `<legend>` (native semantics, no ARIA needed)

For the radiogroup-converted ExportFormatTabs, use `aria-label="File format"` on the radiogroup container (already present; just change role).
