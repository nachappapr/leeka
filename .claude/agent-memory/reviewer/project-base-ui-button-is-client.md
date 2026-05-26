---
name: project-base-ui-button-is-client
description: Base UI Button component is marked 'use client' and uses useButton hook internally — it cannot be safely rendered from a Server Component without the component tree having a client boundary above it
metadata:
  type: project
---

`@base-ui/react/button/Button.js` has a top-level `'use client'` directive and calls `useButton()` internally. This means any Server Component that renders `<ButtonPrimitive>` (directly or via a thin wrapper like `PillButton` that has no `'use client'` of its own) will fail at runtime because React will try to call a hook in a server context.

**Why:** The base-ui Button uses `useButton`, `useRenderElement`, and `React.forwardRef` — all client-only APIs. Its CJS output explicitly contains `'use client'`.

**How to apply:**
- Any component that renders `PillButton` (which wraps Base UI Button) MUST itself be a Client Component (`'use client'`) or must be a child of a Client Component boundary.
- Flag as Critical #1 (SSR integrity) when `PillButton` is used in a file with no `'use client'` directive and no parent client boundary in the same unit.
- The fix direction is: add `'use client'` to the component that renders `PillButton`, OR split out the interactive island into its own `'use client'` file and import it into the server parent.
