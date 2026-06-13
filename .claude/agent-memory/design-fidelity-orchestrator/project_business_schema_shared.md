---
name: business-schema-shared
description: BusinessSchema is shared by onboarding createBusiness AND Settings updateBusinessProfile — never add a required field to it for an onboarding-only need; extend instead
metadata:
  type: project
---

`src/lib/schema/business.ts` `BusinessSchema` (and `BusinessFormData`) is consumed by FOUR call sites, not one:
- `src/lib/actions/business.ts` createBusiness (onboarding write path, `safeParse`)
- `src/lib/actions/business.ts` updateBusinessProfile (Settings write path, `safeParse`)
- `src/components/settings/business-form.tsx` (Settings RHF resolver)
- `src/components/onboarding/onboarding-client.tsx` (onboarding RHF resolver)

**Why:** During the 2026-06-13 onboarding "Your name" reconciliation, adding a required `ownerName` directly to `BusinessSchema` silently broke every Settings business-profile save (`updateBusinessProfile` safeParse returned `{ ok:false, error:"Your name is required" }` because Settings never sends ownerName). Caught by reviewer, not by lint/tsc.

**How to apply:** For any onboarding-only (or surface-only) field, DERIVE a schema via `BusinessSchema.extend({...})` (e.g. `OnboardingBusinessSchema` + `OnboardingBusinessFormData`) and wire only that surface to it. Keep `BusinessSchema` itself at its shared shape. When a child like `OnboardingDetailsPanel` receives the widened form's `register`/`errors`, widen the panel's prop generics to the superset type too (it only reads shared fields — type-level only, no runtime change). `safeParse` strips unknown keys, so a superset payload passed to an action still validating against `BusinessSchema` just drops the extra field — that's the correct intermediate state when the extra field's persistence is deferred. Whenever a "make field X required" task lands on a schema, grep its consumers first.
