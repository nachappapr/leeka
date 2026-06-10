---
name: skeleton-loading-at-pattern
description: Loading skeleton shells have no AT announcement — screen reader users get silent collection of empty unnamed divs; established fix pattern for all loading.tsx files
type: project
---

All seven `loading.tsx` skeleton files (dashboard, invoices, activity, customers, reports, settings, dashboard/help) share the same gap: no `role="status"` or `aria-label` on the outer wrapper, no `aria-hidden` on individual `Skeleton` divs, and no sr-only "Loading…" text.

**Why:** Next.js `loading.tsx` is automatically wrapped in a Suspense boundary by the framework, but does NOT inject any ARIA loading announcement. Screen reader users navigating to a route during its loading phase hear a silent collection of empty unnamed `<div>`s — they have no indication the page is loading.

**How to apply:** The established fix (to use consistently across all loading.tsx files) is to wrap the outermost `<div>` with `role="status"` and `aria-label="Loading [page name]"`, and mark every `Skeleton` instance with `aria-hidden="true"`. This is static HTML — no client boundary cost. Example:

```tsx
<div role="status" aria-label="Loading Dashboard" className="flex flex-1 flex-col">
  <span className="sr-only">Loading…</span>
  {/* all Skeleton elements get aria-hidden="true" */}
  <Skeleton aria-hidden="true" className="h-7 w-40" />
</div>
```

First flagged on EP0 AP-3 audit (2026-06-10). All seven new loading files need the same fix.
