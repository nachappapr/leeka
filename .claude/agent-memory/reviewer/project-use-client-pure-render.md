---
name: project-use-client-pure-render
description: Recurring violation — 'use client' added to pure render components (no hooks, no events, no browser APIs)
metadata:
  type: project
---

Implementers repeatedly add `'use client'` to components that are consumed inside a Client Component parent and have no hooks, event handlers, or browser API calls of their own. Examples: `InvoicesTable` (Unit 7), `InvoicesMobileList` (Unit 7).

**Why:** When a component is a child of a Client Component, it is already included in the client bundle — the child does not need its own `'use client'`. Adding it unnecessarily widens the client boundary, prevents the component from ever being used as a Server Component in another context, and is a principle #1 violation (SSR integrity: `'use client'` only where strictly required).

**How to apply:** Flag any `'use client'` on a component that has zero hooks, zero event handlers (`onClick`, `onChange`, etc.), and zero browser API usage (`window`, `document`, `navigator`). Fix direction: remove the directive. The component becomes a shared module that can be rendered on server or client depending on where it is imported.

Related: [[project-rsc-client-import-boundary]]
