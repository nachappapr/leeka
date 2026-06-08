---
name: project-no-use-client-rides-parent-boundary
description: Confirmed OK pattern — presentational composition files without 'use client' that are only ever imported by 'use client' parents; they are client modules by transitivity and do not need the directive.
metadata:
  type: project
---

Files like `invoice-form-desktop-action-bar.tsx` and `invoice-form-review-stage.tsx` have no `'use client'` directive but compose Client Components. This is intentional and correct when ALL callers are already `'use client'` files — the module is already a client module by transitivity.

Distinguish from [[false-server-component-claim]]: the bad case is a file with an "RSC" comment + no directive that gets imported by a client file without anyone noticing. The good case is a file with an explicit "No 'use client': rides parent boundary" comment + verified that every import site is a `'use client'` file.

**Why:** Next.js module graph: once a file is imported by a client module, it runs on the client regardless of whether it has the directive. The directive is only needed to declare a new client boundary at the module's own entry point.

**How to apply:** Before flagging a missing `'use client'`, check that (a) the comment is explicit about the intent and (b) all import sites are already client modules. If both hold, it is PASS. If any import site is a Server Component, it is Critical #1.
