---
name: project-rsc-client-import-boundary
description: RSC boundary rule — Client Components must not directly import Server Components; use composition inversion (pass as children/props from a server parent)
metadata:
  type: project
---

A `'use client'` file that directly `import`s components without their own `'use client'` directive bundles those components as client modules — they are NOT Server Components in that composition. This is a Critical #1 (SSR integrity) violation.

The correct pattern is **composition inversion**: the server parent (page or container) instantiates the Server Component JSX and passes it down as `children` or named props to the Client island. The Client island never holds the import.

**Why:** Next.js RSC module graph: the `'use client'` boundary is a module-graph cut, not a runtime concept. Any import reachable from a `'use client'` file is bundled client-side regardless of whether it has `'use client'` itself.

**How to apply:** When reviewing a `'use client'` component, check every direct import. If a component lacks `'use client'` and is intended to be a Server Component (async data, server-only APIs, or architecturally labeled as such), flag Critical #1. The fix is always: server parent passes instantiated JSX as children/props; client island receives `children: React.ReactNode`.

**Recurring case:** `InvoicesFilterShell` (Unit 6) imported `InvoicesPageHeader`, `InvoicesTable`, and `InvoicesMobileList` directly — all three were demoted to client modules. The fix: a server container instantiates those three and passes them as children or named slots into `InvoicesFilterShell`.
