# Reviewer memory index

- [Inline style scoping in ESLint](project-inline-style-scoping.md) — no-restricted-syntax ignores src/components/ui/**; disable comment not required there
- [RSC client import boundary](project-rsc-client-import-boundary.md) — Client Components must not import Server Components directly; use composition inversion (server parent passes JSX as children/props)
- [Card wrapper — headerless mode now exists](project-card-wrapper-headerless.md) — title? is optional since commit 42283c6; raw article/div with rounded-2xl bg-card shadow-card in feature code is still High #2; fix is Card with className="p-8 ..."
- ['use client' on pure render components](project-use-client-pure-render.md) — recurring: implementers add 'use client' to child components with no hooks/events; Critical #1; fix is to remove the directive
- [Duplicate sidebar layout per route](project-duplicate-sidebar-layout.md) — each sidebar route copies the full SidebarProvider shell; fix is an (app) route group layout
- [Base UI Button is a Client Component](project-base-ui-button-is-client.md) — Button.js has 'use client' + useButton hook; any file rendering PillButton must have a client boundary; missing boundary is Critical #1
