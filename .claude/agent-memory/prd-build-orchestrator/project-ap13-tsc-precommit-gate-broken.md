---
name: project-ap13-tsc-precommit-gate-broken
description: RESOLVED — the z.coerce.number() resolver tsc errors were fixed in AP-13 Unit 3 via a schema split; check-types is clean at HEAD (verified 2026-06-12)
metadata:
  type: project
---

RESOLVED as of 2026-06-12 (AP-14 invocation). `pnpm check-types` is fully clean (0 errors) at HEAD main. Both the AP-14 implementer and the reviewer independently ran `pnpm check-types` and observed exit 0.

History (kept for context): During AP-13, `pnpm check-types` failed with 6 errors — 3 each in `src/components/invoices/invoice-create-form.tsx` and `invoice-edit-form.tsx` — after the AP-13 Unit 3 vitest install pulled in `@standard-schema/spec@1.1.0`. Root cause was `DraftLineItemSchema` using `z.coerce.number()` (Standard-Schema v1 input type = `unknown`), which made `standardSchemaResolver(DraftFormSchema)` infer a `Resolver<{qty: unknown, ...}>` that wasn't assignable to `useForm<DraftFormData>`.

**Fix that shipped:** the schema-split approach — a form-only `DraftFormLineItemSchema`/`DraftFormSchema` using plain `z.number()` (input === output) for the resolver, while `DraftLineItemSchema`/`SaveInvoiceDraftSchema` keep `z.coerce.number()` as the server-action trust boundary. This is documented inline in `src/lib/schema/invoice.ts` (see the DraftFormLineItemSchema header comment). Confirmed clean across AP-14.

**Why this matters going forward:** Do NOT carry the "main is not tsc-clean" assumption into future invocations — it is false now. Trust the implementer's GATE evidence and the reviewer's independent re-run. When a "pre-existing" failure appears right after a dependency install, diff the lockfile before concluding the gate was bypassed (the original diagnostic lesson still holds).
