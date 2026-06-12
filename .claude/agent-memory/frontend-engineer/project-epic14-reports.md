---
name: project-epic14-reports
description: AP-34 Reports page patterns — recharts lazy-load, server-side range computation, RPC data layer, chart a11y
type: project
---

AP-34 shipped 2026-06-12. Reports page at /reports with date-range selector + metric cards + lazy recharts bar chart.

Key patterns established:
- recharts installed (v3.8.1); only imported in `reports-chart.tsx` (dynamically loaded). Lazy wrapper at `reports-chart-lazy.tsx` uses `next/dynamic({ ssr: false })` — recharts NOT in initial bundle.
- RPC `get_reports_metrics` returns `Json` type; narrowed via runtime shape-guard in `src/lib/data/reports.ts` (no `as any`).
- Date range computed server-side in `src/lib/constants/reports.ts`; Indian FY = Apr 1 → Mar 31.
- Range chips are `<Link scroll={false}>` with `aria-current="page"` + underline on selected — Server Component, no "use client" needed.
- Chart a11y: `aria-hidden` on recharts container, sr-only `<table>` sibling with same data (`reports-chart-table.tsx`).
- `formatPaise` from `@/lib/utils` (re-exports from `src/lib/utils/format-currency.ts`) used for paise→₹ throughout.
- `DEFAULT_RANGE_ID = "6M"` — validated in page.tsx before passing to container.
- Tooltip formatter in recharts must accept `ValueType | undefined` (not just `number`) — use typeof guard.

**Why:** parallel builds (AP-33, AP-35) running in same tree; file lane strictly limited to reports/** + lib/data/reports.ts + lib/types/reports.ts + lib/constants/reports.ts.
**How to apply:** for future chart features: same lazy pattern, same a11y table pattern, same `formatPaise` util.
