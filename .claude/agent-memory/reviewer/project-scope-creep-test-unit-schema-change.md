---
name: project-scope-creep-test-unit-schema-change
description: Recurring pattern — test/infra units silently fix production tsc failures as scope creep; should be FOLLOW-UP not silent fix
metadata:
  type: project
---

AP-13 Unit 3 (vitest install + tests) changed production code to make the tsc gate pass:

1. `src/lib/schema/invoice.ts` — `z.coerce.number()` → `z.number()` on 4 fields (security boundary change)
2. `src/components/invoices/invoice-create-form.tsx` + `invoice-edit-form.tsx` — added `as Resolver<DraftFormData>` cast to resolve a tsc failure (later traced to the vitest install adding @standard-schema/spec — a latent mismatch surfaced by new deps, not a pre-existing red main)

Both were described as "opportunistic fixes" in the implementer's self-report. This is a recurring pattern: test/infra units have a tsc gate, type failures (sometimes latent ones surfaced by the dep install itself — diff the lockfile before calling them pre-existing) make the gate fail, implementer fixes them silently in the same commit rather than filing a FOLLOW-UP.

**Why this is Medium #13 scope creep (not Critical):** the production behavior change (coerce→non-coerce) was benign given the actual call path, but the *principle* violation is real — a test infra unit changed the server-side trust boundary.

**How to apply:** when a test/infra unit touches production files that were not in scope, flag as Medium #13 (scope creep) even if the change appears safe. Prescribed fix: revert the production changes, add a FOLLOW-UP ticket for the tsc failures, re-run tsc AND diff the lockfile — a failure that appears right after a dependency install may be surfaced by the new packages, not pre-existing.

See: [[project-zod-input-output-split-and-resolver-cast]]
