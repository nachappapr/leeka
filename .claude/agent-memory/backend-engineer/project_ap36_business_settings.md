---
name: ap36-business-settings
description: AP-36 backend — business-logos Storage bucket, Storage RLS, updateBusinessProfile SA, uploadBusinessLogo SA, getBusinessLogoSignedUrl helper
type: project
---

## Settled decisions

- `business-logos` bucket: `public=false`, `file_size_limit=2097152` (2 MB), `allowed_mime_types=['image/png','image/jpeg','image/webp','image/svg+xml']`
- Storage RLS uses `(storage.foldername(name))[1]::uuid` to extract business_id from path `{business_id}/{filename}`, checked against `public.business_members`
- `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY` is NOT allowed in migrations — Supabase owns that table; RLS is already on by default. Drop that line if it appears.
- `businesses.logo_url` column already existed (nullable text) before AP-36 — NO table migration needed
- Phone is READ-ONLY in profile settings, sourced from `profiles` table — NOT written via `updateBusinessProfile`
- `updateBusinessProfile` uses direct typed `.from("businesses").update({...}).eq("id", businessId)` — no RPC needed, member UPDATE RLS enforces tenancy
- `uploadBusinessLogo` SA: accepts FormData, validates MIME+size server-side, uploads to `{business_id}/logo.{ext}` with `upsert:true`, returns `{ ok, path }`
- `getBusinessLogoSignedUrl` in `src/lib/data/business.ts`: server-only, 3600s TTL, returns null on error
- Constants `LOGO_ALLOWED_MIME_TYPES` + `LOGO_MAX_BYTES` in `src/lib/constants/business.ts` — shared by client (UX) and server (security boundary)
- `logoUrl: z.string().optional().or(z.literal(""))` added to BusinessSchema

**Why:** `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY` fails with "must be owner of table objects" — Supabase owns the storage schema.

**How to apply:** For any future storage bucket migration, skip the `ALTER TABLE storage.objects` line entirely.
