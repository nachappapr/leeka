---
name: project-epic15-settings
description: Epic 15 Settings — story breakdown, what UI pre-exists static; AP-36 approved, AP-37 awaiting human review (shared-toggle a11y decision pending) as of 2026-06-12
metadata:
  type: project
---

Epic 15 — Settings (Milestone M3). Stories: AP-36 business profile (P0/M), AP-37 tax & GST defaults (P0/S), AP-38 invoice template (P1/S), AP-39 notifications & reminder settings (P1/S), AP-40 language (P0/S).

**Why:** Settings epic configures business, tax, template, language, plan. Started AP-36 on 2026-06-12.

**How to apply:**
- The entire Settings UI already exists as STATIC components from a prior design-fidelity pass: `src/components/settings/*` (business-section, tax-section, template-section, notifications-section, language-section, plan-section, items-section, reminder-settings-panel). Most are hardcoded `defaultValue`s with `type="button"` non-functional buttons. AP-36–40 are WIRING stories, not greenfield UI.
- `SettingsContainer` is a Client Component (`"use client"`) holding section state; sections are conditionally rendered children.
- Already wired (prior epics): `reminder-settings-panel` (AP-30), `items-section` (AP-12) — both go through `src/app/(app)/settings/actions.ts` which already uses an `eslint-disable no-explicit-any` for untyped RPCs. New AP-36+ code must NOT copy that pattern — regenerate types instead (code-quality non-negotiable).
- AP-36 specifics: `updateBusinessProfile` Server Action (PRD §6.1) does NOT exist yet — only `createBusiness` (RPC `create_business`) in `src/lib/actions/business.ts`. `getBusinessForUser()` read exists in `src/lib/data/business.ts`. `BusinessSchema` exists in `src/lib/schema/business.ts` (name/address/stateCode/gstin/upiId, GSTIN mod-36 checksum). businesses table RLS already allows member UPDATE (migration 20260611203803) — so update can go via the RLS-scoped client, no new RPC strictly needed for the field update.
- AP-36 introduces the FIRST Supabase Storage usage in the repo — no buckets exist, no `.storage.from` anywhere. Logo upload needs a bucket + Storage RLS policies (a DB-write unit → backend-engineer → real MCP evidence).
- AP-36 "AC: logo reflected on PDF" — PDF generation (Epic 8 / AP-21) is SKIPPED/deferred per prior epics. The PDF leg of AP-36's AC is therefore deferred to whenever AP-21 lands; AP-36 persists logo_url and shows it in-app. Surface this as a deviation, do not block.
- AP-36 — APPROVED & committed b7f7bfb on main (2026-06-12).
- AP-37 (tax & GST defaults) — built 2026-06-12, AWAITING HUMAN REVIEW. No migration needed: `businesses.gst_enabled` (default true) + `businesses.default_gst_rate` (default 18) already existed. NO `tax_type` column — "Tax type" is a fixed read-only "GST" field (app is GST-only). New files: `src/lib/schema/tax.ts` (TaxSchema: integer 0–28 + gstEnabled), `src/components/settings/tax-form.tsx` (client form), `updateTaxDefaults` action in `src/lib/actions/business.ts`, `getBusinessTaxDefaults` read in `src/lib/data/business.ts`. Tax section converted to Server-Component-fetch + client-form + `taxSlot` (mirrors `businessSlot`). Invoice create/edit now seed new blank lines' `gst_rate` from business default (fallback 18, was hardcoded 5); existing draft lines keep stored rate; saved-item own rate still wins. `SETTINGS_TAX_TOGGLES` deleted (dead). The two static toggles "Show HSN/SAC" + "Apply tax to shipping" deferred (no backing columns) — FOLLOW-UP needs migration.
- AP-37 OPEN DECISION blocking a11y PASS: accessibility-auditor flagged 2 HIGH contrast fails (WCAG 1.4.11) on the SHARED `ui/custom/toggle-switch.tsx` coral ON-state (white thumb on #f46a39 = 2.89:1; track on #fbf6ef = 2.69:1). Fix = `bg-coral`→`bg-coral-press` (#d9531f), but that mutates a FROZEN shared wrapper AND changes coral ON-state app-wide (also used by notifications-section). Collides with the recorded "shared wrappers frozen" rule + the standing accepted coral-contrast deferral. NOT auto-fixed — surfaced to human. Reviewer PASS, lint+tsc clean, AP-37-local Medium (`inputMode="numeric"` on rate field) fixed.
