---
name: duplicate-header-landmark
description: InvoiceDetailHeader uses <header> which creates a second banner landmark alongside Topbar's <header>; fix is to use <div>
type: project
---

`InvoiceDetailHeader` (`src/components/invoices/invoice-detail-header.tsx`) originally used `<header>` as its root element. Because it is a direct descendant of `<main>` (not nested inside `<article>`, `<aside>`, `<nav>`, or `<section>`), it is promoted to a `banner` landmark by the browser — duplicating the banner already created by `<Topbar>`.

**Why:** ARIA landmark semantics: the `banner` role implies "the page header". Only one banner per page is the expected contract. Two banners cause AT users to see "banner" twice in the landmarks pane (NVDA / VoiceOver rotor), with no way to distinguish them.

**How to apply:** Any `<header>` that is not the true page-level header (i.e., it's a sub-section title bar inside a content area) must use `<div>` instead. The page-level banner is owned by `Topbar`. All other structural "header rows" inside cards or content sections use `<div>`. Flag any `<header>` that does not sit at the very top of the page tree.
