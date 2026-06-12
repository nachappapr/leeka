---
name: project-ap38-invoice-template
description: AP-38 invoice template backend — accent_color + footer_message columns on businesses, TemplateSchema, updateInvoiceTemplate SA
metadata:
  type: project
---

## Settled decisions from AP-38 (completed 2026-06-13)

**Migration:** `20260613120000_ap38_invoice_template_columns.sql` — applied to main project (Option B authorization).

**Two columns added to public.businesses:**
- `accent_color text NOT NULL DEFAULT '#F46A39'` with CHECK (`~ '^#[0-9A-Fa-f]{6}$'`)
- `footer_message text NOT NULL DEFAULT 'Thank you for your business!'` with CHECK (`char_length <= 120`)

No new tables, no RLS changes — existing businesses UPDATE policy already covers the write.

**getBusinessId exported:** The `getBusinessId` helper in `src/lib/actions/business.ts` was promoted from private `async function` to `export async function` so `template.ts` can import it. This is the canonical shared helper for businessId lookups.

**TemplateSchema** (`src/lib/schema/template.ts`):
- `accentColor`: refine against `SETTINGS_ACCENTS` (imported from constants) — rejects any hex not in the 6-value allowlist
- `footerMessage`: trim transform → pipe → max(120) — empty string is valid

**updateInvoiceTemplate SA** (`src/lib/actions/template.ts`):
- Mirrors updateTaxDefaults exactly: safeParse → createClient → getUser → getBusinessId → RLS-scoped update
- logger.error pattern: `{ err: { code: error.code } }, "updateInvoiceTemplate: update failed"`
- Uses `TablesUpdate<"businesses">` for the patch — strongly typed, no `any`

**TypeScript types:** `src/lib/types/database.ts` regenerated — `accent_color: string` and `footer_message: string` appear in Row (non-nullable) and Update (optional) on businesses.

**Why:** Epic 15 AP-38, per-business invoice branding persisted at the businesses row level. No RPC needed — plain RLS-scoped UPDATE suffices since there's no atomicity requirement.

**How to apply:** Future settings columns that are simple scalar writes on businesses follow this exact pattern: ALTER TABLE + CHECK + no new RLS + updateX SA mirroring updateTaxDefaults.
