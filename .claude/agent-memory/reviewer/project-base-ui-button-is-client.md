---
name: project-base-ui-button-is-client
description: Base UI Button is a Client Component ('use client'); PillButton wraps it WITHOUT its own directive. A Server Component CAN render PillButton — this is the established, working codebase pattern. Do NOT flag it.
metadata:
  type: project
---

`@base-ui/react/button/Button.js` has a top-level `'use client'` directive. `PillButton` (`src/components/ui/custom/pill-button.tsx`) wraps it and has NO `'use client'` of its own.

**This is correct and intentional. A Server Component rendering `PillButton` is valid RSC and does NOT fail at runtime.** A Server Component may import and render a Client Component; the `'use client'` on Base UI Button is itself the client boundary, and `useButton()` only ever runs on the client. There is no "hook called in a server context" — the wrapper passes through to a client module.

**Evidence (verified 2026-06-08):** ~15 Server Components across the repo render `PillButton` with no `'use client'` directive and ship fine — `home/hero.tsx`, `home/cta-band.tsx`, `home/pricing-plan.tsx`, `customers/customer-detail-header.tsx`, `customers/customer-contact-card.tsx`, `settings/plan-section.tsx`, `invoices/invoices-page-header.tsx`, `invoices/invoice-detail-header.tsx`, `invoices/invoice-actions-open.tsx`, `dashboard/dashboard-greeting.tsx`, `not-found/not-found-nav.tsx`, `not-found/not-found-copy.tsx`, etc. Keeping these as Server Components is the RSC-by-default non-negotiable working as intended.

**Why the previous version of this memory was wrong:** it asserted "any Server Component that renders Base UI Button will fail because React calls a hook in a server context." That misreads the RSC model — Server→Client rendering is the whole point of `'use client'`. The claim produced repeated FALSE-POSITIVE Critical findings (twice on the 404 page).

**How to apply:**
- Do NOT flag `PillButton` (or other Base UI wrappers) used inside a Server Component as an SSR/boundary violation. It is correct.
- A real violation only exists if a **Server Component passes a non-serializable prop** (e.g. an inline `onClick`/function/event handler) directly to PillButton/Base UI — THAT fails ("Functions cannot be passed to Client Components"). Flag that specific case, not the mere rendering.
- The other real case: the wrapper file itself calling a client-only hook (`useState`/`useEffect`/`useButton`) at its OWN top level without `'use client'`. PillButton does not do this — it only renders.
