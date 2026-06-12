---
name: feedback-rhf-standard-schema-resolver
description: react-hook-form + standardSchemaResolver type gap — z.coerce.number() or .default() on shared schemas used as trust boundaries
metadata:
  type: feedback
---

**The type gap:** `standardSchemaResolver(ZodSchema)` with `useForm<T>` fails tsc when the schema uses `z.coerce.number()` (Standard Schema input type = `unknown`) or `.default()` (input type = `T | undefined`). The resolver returns `Resolver<Input, Context, Output>` where `Input` ≠ `T`, so it doesn't satisfy `useForm<T>`'s `Resolver<T, any, T>` requirement.

**DO NOT fix with:** `as Resolver<T>` cast — reviewer rejects this as masking a real type gap (AP-13 cycle 1, 2026-06-12).

**DO NOT fix by changing `z.coerce.number()` to `z.number()` on `DraftLineItemSchema`** — that is the server-action trust boundary. Changing coerce behaviour on a production security-boundary schema is out-of-scope for a test infra unit.

**Reviewer's prescribed direction:** `standardSchemaResolver<DraftFormData>(DraftFormSchema)` — but this requires 3 type params (`Input, Context, Output`) in `@hookform/resolvers@5.4.0`. Full call `standardSchemaResolver<DraftFormData, any, DraftFormData>(DraftFormSchema)` also fails because `DraftFormSchema` doesn't structurally satisfy `StandardSchemaV1<DraftFormData, DraftFormData>` (coerce fields have `unknown` input type in the schema's `~standard.types`).

**Status (RESOLVED 2026-06-12, AP-13 Unit 3):** Fixed by schema split — see below.

**The fix (approach b — schema split):**
- Added `DraftFormLineItemSchema` (unexported, internal) in `src/lib/schema/invoice.ts` using `z.number()` (not `z.coerce`) for qty/unit_price/discount/gst_rate
- `DraftFormSchema` now uses `DraftFormLineItemSchema` (form layer) — input type === output type → resolver satisfies `useForm<DraftFormData>` without any cast
- `DraftLineItemSchema` (z.coerce) and `SaveInvoiceDraftSchema` are completely untouched — server trust boundary preserved
- Removed `.default(0)` from discount and `.default("")` from notes in the form schema — `defaultValues` in `useForm` supplies defaults, not the schema; this ensures input=output symmetry
- Zero ripple to `InvoiceFormBody`, `InvoiceFormItemsTable`, `InvoiceFormItemsMobile` — their prop types (`UseFormRegister<DraftFormData>`, `Control<DraftFormData>`) are unchanged because `DraftFormData` type is structurally identical

**Runtime safety:** z.number() (no coerce) is correct because qty uses `{ valueAsNumber: true }`, and unit_price/discount/gst_rate use Controller with explicit parseFloat/Math.round — actual numbers always delivered to form state.

**How to apply:** When you see this type error on `useForm`, stop and check if the schema is a shared server/form schema with coerce or defaults. The real fix is to split schemas (form layer with z.number, server layer with z.coerce), not to cast.
