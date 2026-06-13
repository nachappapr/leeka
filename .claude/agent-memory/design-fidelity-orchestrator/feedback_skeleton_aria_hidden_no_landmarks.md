---
name: skeleton-aria-hidden-no-landmarks
description: Inside an aria-hidden skeleton subtree, decorative wrappers must be plain <div>, never sectioning/landmark elements (<aside>/<section>/<header>/<nav>) — even when the real component uses one
metadata:
  type: feedback
---

Inside a loading-skeleton subtree whose root carries `aria-hidden="true"`, decorative region wrappers MUST be plain `<div>` — do NOT mirror the real component's sectioning element (`<aside>`, `<section>`, `<header>`, `<nav>`). The skeleton mirrors the real component's *layout classes* for zero layout shift, NOT its element *types*.

**Why:** accessibility-auditor ruled definitively (2026-06-13, activity-skeleton unit) per WAI-ARIA 1.2 §6.6: aria-hidden erases the element AND all descendants (roles, landmarks, labels) from the accessibility tree, so `<aside aria-label="…">` and `<div>` produce IDENTICAL (zero) AT output there. Given equal AT output, `<div>` is the correct engineering choice: an `<aside>` carries an implied role=complementary that is source-misleading and risks exposing a wrong landmark (a complementary region full of shimmer bars) if a future refactor moves the aria-hidden boundary inward. This is the same risk class as [[skeleton-topbar-header-landmark]] (the kit's internal `<header>` — latent, accepted, fixed only in a kit-level a11y pass). The reviewer asked for `<aside>` for "DOM parity"; that finding was REJECTED.

**How to apply:** When the reviewer flags a skeleton `<div>` and asks to switch it to the real component's `<aside>`/`<section>`/landmark for DOM parity, REJECT it — keep the `<div>`. Tell the implementer explicitly in the handoff: mirror layout classes, use plain `<div>`/`<span>`/`<ul>`/`<li>` only, no sectioning/landmark/heading elements inside the aria-hidden skeleton root. The lone exception is the shared kit's SkeletonTopbar/SkeletonPageHeader which render their own `<header>` internally — those are accepted-as-is (reuse, do not modify) because they always sit inside an aria-hidden root.
