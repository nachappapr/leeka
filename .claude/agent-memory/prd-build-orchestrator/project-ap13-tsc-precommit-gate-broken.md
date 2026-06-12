---
name: project-ap13-tsc-precommit-gate-broken
description: tsc errors in invoice forms surfaced by vitest install adding @standard-schema/spec — latent, NOT a bypassed pre-commit gate
metadata:
  type: project
---

As of 2026-06-12, `pnpm check-types` fails with 6 errors — 3 each in `src/components/invoices/invoice-create-form.tsx` and `invoice-edit-form.tsx` — whenever `@standard-schema/spec@1.1.0` is present in node_modules. Root cause: `DraftLineItemSchema` in `src/lib/schema/invoice.ts` uses `z.coerce.number()`, whose Standard-Schema v1 input type is `unknown`; `standardSchemaResolver(DraftFormSchema)` therefore infers `Resolver<{qty: unknown, ...}>` which is not assignable to `useForm<DraftFormData>`'s required `Resolver<DraftFormData>`.

**Why (corrected by main conversation):** AP-13 Units 1+2 were NOT committed with a red gate — `tsc` genuinely passed at both commits (`60a88f1`, `d94790d`; hook output confirms). The AP-13 Unit 3 vitest install added `@standard-schema/spec@1.1.0` to the dependency tree (lockfile diff proves it was new), which changed TypeScript's resolution of `standardSchemaResolver`'s generics and surfaced the latent mismatch. "Stash and re-run tsc on pristine HEAD" was a flawed verification: stashing reverts source but NOT node_modules, so the new package stayed installed. Lesson: when a "pre-existing" failure appears right after a dependency install, diff the lockfile before concluding the gate was bypassed.

**How to apply:** Do not attribute the errors to test work or to a process gap. Candidate fixes (needs its own scoped review): (a) type the form with zod's input/output split — `useForm<z.input<typeof DraftFormSchema>, unknown, z.output<typeof DraftFormSchema>>` (RHF ≥7.55 three-generic pattern, no schema change); or (b) split schemas — form-only `z.number()` schema for the resolver, keeping `z.coerce.number()` as the server-action boundary. The reviewer-suggested `standardSchemaResolver<DraftFormData>(...)` single-generic call does NOT compile on `@hookform/resolvers@5.4.0`.
