---
name: project-ap36-business-profile
description: AP-36 business profile settings — slot pattern, Server/Client split, logo upload architecture
type: project
---

**AP-36 business profile settings shipped (Epic 15 unit 1)**

Architecture decision: `SettingsContainer` is "use client" so `BusinessSection` (async Server Component) cannot be rendered inside it directly. Used the same `businessSlot?: React.ReactNode` slot pattern as `notificationsSlot`.

Component split:
- `src/components/settings/business-section.tsx` — async Server Component; fetches `getBusinessForUser()`, `getProfile()`, `getBusinessLogoSignedUrl()` in parallel; passes typed props to `BusinessForm`
- `src/components/settings/business-form.tsx` — "use client"; RHF + `standardSchemaResolver(BusinessSchema)`; owns logo upload, save/cancel, useTransition pending state
- `src/app/(app)/settings/page.tsx` — passes `<BusinessSection />` as `businessSlot`
- `src/components/settings/settings-container.tsx` — added `businessSlot?` prop; renders `businessSlot ?? <BusinessSection />` (fallback kept for safety)

**Why:** settings-container is client-only (useState for section switching). Server-fetched data must be composed at the page level and passed as ReactNode slots.

**Logo upload flow:** client-side MIME+size guard → `uploadBusinessLogo(formData)` → `updateBusinessProfile({ logoUrl: path })` → show `URL.createObjectURL(file)` as immediate preview. Both upload errors and save errors surface via `brandToast.error`.

**Phone field:** READ-ONLY, sourced from `profiles.phone` via `getProfile()`. Rendered as a disabled+readOnly InputField. No write path.

**RHF resolver:** `standardSchemaResolver` from `@hookform/resolvers/standard-schema` (not zodResolver) — this is the project convention confirmed in business-wizard.tsx.

**img vs next/image:** Logo uses `<img>` (not `<Image />`) because the src is either a Supabase signed URL (dynamic domain, no configured remotePattern) or a `blob:` object URL. ESLint disable comment with justification inline.

**How to apply:** Any future settings section that needs server-fetched prefill data should use the slot pattern (pass as `<SomeSection />` from page.tsx) rather than adding data fetching to the client container.
