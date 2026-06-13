---
name: skeleton-topbar-header-landmark
description: Shared SkeletonTopbar renders a real <header>; a11y-auditor wants it <div>/role=none — deferred kit-level fix, not a per-unit defect
metadata:
  type: project
---

`src/components/ui/custom/skeleton-topbar.tsx` line ~15 renders a real `<header>` element. accessibility-auditor flagged this (2026-06-13, during the invoice-form-skeleton unit) as WCAG 1.3.1/4.1.2: a decorative placeholder should not be a sectioning element.

**Why:** In every current consumer the SkeletonTopbar sits inside an `aria-hidden="true"` skeleton-root subtree (dashboard-skeleton, invoices-skeleton, invoice-form-skeleton), so the `<header>` is invisible to AT today — the finding is latent, not a live violation. The risk is only realized if a future refactor moves the aria-hidden boundary inward and exposes a nameless landmark.

**How to apply:** This is a SHARED KIT change touching 3+ already-shipped skeletons — out of scope for any single feature skeleton unit (kit is "reuse, do not modify"). Do NOT auto-fix it inside a feature unit. When a user approves a kit-level a11y pass, change `<header>` → `<div>` (or add `role="none"`) in skeleton-topbar.tsx; it is a static one-line change, no client-boundary cost, no effect on shimmer/animation. Verify the file still renders the same grid/sticky classes after the swap.
