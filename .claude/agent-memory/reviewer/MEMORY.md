# Reviewer memory index

- [Inline style scoping in ESLint](project-inline-style-scoping.md) — no-restricted-syntax ignores src/components/ui/**; disable comment not required there
- [RSC client import boundary](project-rsc-client-import-boundary.md) — Client Components must not import Server Components directly; use composition inversion (server parent passes JSX as children/props)
- [Card wrapper — no headerless mode](project-card-wrapper-headerless.md) — Card.title is required; raw divs replicating rounded-2xl bg-card shadow-card are High #2; fix is to make title optional in Card
- ['use client' on pure render components](project-use-client-pure-render.md) — recurring: implementers add 'use client' to child components with no hooks/events; Critical #1; fix is to remove the directive
- [Duplicate sidebar layout per route](project-duplicate-sidebar-layout.md) — each sidebar route copies the full SidebarProvider shell; fix is an (app) route group layout
