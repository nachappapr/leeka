---
name: table-scope-pattern
description: DataHead (<th>) wrappers in Lekka ship without scope="col"; multi-column tables require it per WCAG 1.3.1 / H63
metadata:
  type: project
---

The Lekka `DataHead` wrapper (`src/components/ui/custom/data-table.tsx`) and the underlying shadcn `TableHead` primitive (`src/components/ui/primitives/table.tsx:68`) both render a native `<th>` but neither sets `scope="col"`. The `DataTable` compound is a multi-column table (5 columns in the invoices view), so header cells must carry `scope="col"` to satisfy WCAG SC 1.3.1 / Technique H63.

**Why:** Without `scope`, screen readers cannot reliably associate header cells with data cells when navigating by column. This is a recurring pattern — every `DataHead` in every table will have this gap until the primitive or wrapper adds `scope="col"` as a default.

**How to apply:** Flag `scope` absence whenever auditing any `DataHead` / `TableHead` usage in a multi-column layout. The canonical fix is adding `scope="col"` as a default prop in `DataHead` (or the underlying `TableHead`). The fix is pure static HTML — no CLIENT-BOUNDARY IMPACT.
