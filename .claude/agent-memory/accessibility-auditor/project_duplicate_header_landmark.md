---
name: duplicate-header-landmark
description: In Lekka all page content is inside SidebarInset (<main>), so <header> inside it is scoped (role=generic, NOT banner). No duplicate-banner risk from sub-section headers in this layout.
type: project
---

In Lekka's layout tree, `SidebarInset` renders a `<main>` element. Per the HTML5/ARIA spec, a `<header>` element has `role="banner"` **only** when it is NOT a descendant of `<article>`, `<aside>`, `<main>`, `<nav>`, or `<section>`. Because all page components (including `Topbar`) are rendered inside `<main>` via `SidebarInset`, every `<header>` in the tree — including `Topbar`'s — is scoped to `role="generic"`, not `role="banner"`. The `<html>` root has no dedicated page-level `<header>` outside `<main>`.

**Consequence:** There is no `banner` landmark in the rendered output at all. This is a different (and separately auditable) concern — not a duplicate-banner problem. Sub-section `<header>` elements inside `<main>` do not create extra banners.

**Why:** Previous memory incorrectly stated that a `<header>` inside `<main>` (SidebarInset) creates a second banner. The HTML spec scopes the banner role to headers that are direct descendants of `<body>` or outside any sectioning content element (`<main>`, `<article>`, `<aside>`, `<nav>`, `<section>`).

**How to apply:** In Lekka, never flag `<header>` inside page content as a duplicate-banner violation. The landmark audit concern is instead: does the app have any `banner` landmark? Currently no. That is a separate Medium finding if raised. Sub-section `<header>` elements (like `InvoiceEditHeader`) are safe to use — they render as `role="generic"` inside `<main>`.
