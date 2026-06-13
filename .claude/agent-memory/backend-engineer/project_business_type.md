---
name: project-business-type
description: business_type column added to businesses table; create_business RPC updated to 6-arg version
type: project
---

`business_type text` (nullable, CHECK IN ('retail','services','wholesale','food')) added to `public.businesses` on 2026-06-13.

Migration: `20260613230000_businesses_add_business_type.sql`

- Old 5-arg `create_business` DROPped; new 6-arg version with `p_business_type text` as trailing param.
- RPC raises `BUSINESS_TYPE_REQUIRED` when `trim(coalesce(p_business_type,'')) = ''`; CHECK constraint rejects out-of-set values.
- `BusinessSchema` in `src/lib/schema/business.ts` adds `businessType` as required `z.enum` over `BIZ_TYPES` ids (Zod v4 syntax: `{ error: "..." }` not `{ required_error, invalid_type_error }`).
- `createBusiness` action in `src/lib/actions/business.ts` passes `p_business_type: businessType` and maps `BUSINESS_TYPE_REQUIRED` / `INVALID_BUSINESS_TYPE` to friendly messages.
- `Tables<'businesses'>` now includes `business_type: string | null`.

**Why:** onboarding form redesign prerequisite — business type is required on new creates, nullable for the 1 existing row.

**How to apply:** existing row has `business_type = NULL`; app enforces the required constraint at the RPC + zod layer only on new creates.
