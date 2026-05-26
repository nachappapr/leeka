---
name: table-scope-pattern
description: DataHead scope="col" is now set as a default in the wrapper — prior finding is resolved as of InvoicesTable Unit 4 audit
metadata:
  type: project
---

**RESOLVED (2026-05-26).** `DataHead` (`src/components/ui/custom/data-table.tsx:45`) now sets `scope="col"` as a default prop before spreading `...props`. The underlying `TableHead` primitive does not set it, but the `DataHead` wrapper does — so all `DataHead` usages throughout the app inherit `scope="col"` automatically.

**Why this was flagged originally:** Earlier versions of `DataHead` passed no `scope`, causing screen readers to be unable to reliably associate header cells with data cells in multi-column tables (WCAG SC 1.3.1 / H63).

**How to apply:** Do NOT re-flag `scope` absence for `DataHead` usages — the default is already in place. Only flag if a call-site explicitly overrides `scope` with an incorrect value, or if a raw `TableHead` (bypassing `DataHead`) is used without `scope`.

**Edge case noted during Unit 4 audit:** The decorative chevron column header uses `<DataHead aria-hidden />`. This renders `<th scope="col" aria-hidden="true">`. The `aria-hidden` hides the element from AT entirely; the `scope` attribute is therefore inert from AT's perspective. The combination is redundant but not harmful. The 6th data column cells (chevron `<td>`) have no AT-visible column header — acceptable while the chevron is purely decorative and rows are non-interactive.
