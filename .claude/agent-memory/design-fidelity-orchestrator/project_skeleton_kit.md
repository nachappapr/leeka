---
name: skeleton-kit
description: The per-page loading-skeleton batch — shared kit location, decomposition pattern, and the local-duplicate convention for table column descriptors
metadata:
  type: project
---

Per-page loading skeletons are an in-progress batch (dashboard + invoices-list + invoice-detail shipped as of 2026-06-13). Shared kit lives in `src/components/ui/custom/`:
- `skeleton-shimmer.tsx` — `SkeletonBlock`/`SkeletonCircle`/`SkeletonPill` (className-controlled size/radius; `onBg` prop for warm-bg blocks; NO aria-hidden inside — page wrapper owns the a11y boundary).
- `skeleton-table.tsx` — `SkeletonTable` + `SkeletonTableColumn` descriptor API (kind avatar|text|pill|amount|action, bodyWidth, headWidth, align, cellClassName), built on the real `DataTable` family.
- `skeleton-page-header.tsx` — `SkeletonPageHeader` (NEW 2026-06-13), mirrors the real `PageHeader`. Props: `back?`, `actions?` (default 2), `titleW?` (Tailwind width class), `variant?: "actions" | "pill"`. Reusable by customers/activity/reports/detail/create skeletons.
- The shimmer CSS (`.sk`/`.sk-onbg`/`@keyframes sk-shimmer`, reduced-motion-gated) is ALREADY in `globals.css` — never re-add or modify it.

**Why:** consistency + zero layout shift across all page loading states; the kit is the single source.

**How to apply:** for any new page skeleton — (1) feature consumer `src/components/<feature>/<feature>-skeleton.tsx` (Server Component, `aria-hidden="true"` on root), (2) `loading.tsx` composes only and mirrors `dashboard/loading.tsx` exactly (`role="status"` + `aria-label` + sr-only "Loading…" wrapper around the skeleton). Reuse the kit; never re-implement primitives or touch globals.css. The `<feature>-skeleton.tsx` must mirror the REAL page's layout/breakpoints (derive from the actual components, don't assume) for zero layout shift.

**Accepted convention — table column descriptors are LOCAL duplicates, not shared.** Each skeleton defines its own `<FEATURE>_TABLE_COLUMNS: ReadonlyArray<SkeletonTableColumn>` co-located in its skeleton file, even when identical to another (invoices == dashboard's mini-table descriptor). Reviewer confirmed this is intentional co-location (each skeleton owns the columns it mirrors), NOT scope creep — do not "DRY" these into a shared const.

**RESOLVED:** the deferred `TopbarSkeleton` extraction has shipped — `src/components/ui/custom/skeleton-topbar.tsx` now exists (props `titleW?`, `subtitleW?`, `subtitle?`) and all skeletons consume it; no more private copies.

**Invoice-detail skeleton (shipped 2026-06-13):** `src/components/invoices/invoice-detail-skeleton.tsx` + `src/app/(app)/invoices/[id]/loading.tsx`. Single exported `InvoiceDetailSkeleton` with two private helpers (`PreviewCardSkeleton`, `SideColumnSkeleton`) — same private-helper convention as invoices-skeleton's `MobileCardsSkeleton`. Mirrors `invoice-detail-container.tsx` grid `grid-cols-[minmax(0,1fr)_380px] max-tablet:grid-cols-1`, the preview card (desktop table + mobile list split), the 3 side cards, and the `fixed bottom-0 min-mobile:hidden` mobile footer (content reserves space via `max-mobile:pb-24`). Status-tip skeleton uses neutral `bg-card` (no status tone to imply). All 3 gates clean, no deviations.
