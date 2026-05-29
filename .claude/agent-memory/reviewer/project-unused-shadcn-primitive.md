---
name: project-unused-shadcn-primitive
description: Implementers add a shadcn-generated primitive file (e.g. select.tsx) that is never imported by any file in src/; the brand wrapper goes directly to Base UI raw API instead
metadata:
  type: project
---

Recurring pattern: when adding a Base-UI-backed brand wrapper, the implementer also generates the full shadcn primitive shim but then writes the brand wrapper directly against the Base UI raw API (`@base-ui/react/select`), leaving the primitive shim (`src/components/ui/primitives/select.tsx`) with zero consumers in `src/`.

**Why:** The implementer appears to run `shadcn add select` as scaffolding, then decides to use the Base UI API directly in the wrapper — a reasonable choice — but forgets to delete the unused primitive.

**How to apply:** Flag any new untracked file in `src/components/ui/primitives/` that has zero import consumers as Medium #14 (dead code). Also flag touches to out-of-scope primitives (e.g. `button.tsx`) as Medium #13 (scope creep) when the stated unit didn't require them.
