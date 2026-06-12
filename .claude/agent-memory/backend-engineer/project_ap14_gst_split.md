---
name: project-ap14-gst-split
description: AP-14 settled decisions — per-line GST split columns, RPC rewrite, action wiring, round_off persistence
metadata:
  type: project
---

## Settled decisions from AP-14 (completed 2026-06-12)

**Schema change:**
- `invoice_line_items` now has `cgst integer NOT NULL default 0`, `sgst integer NOT NULL default 0`, `igst integer NOT NULL default 0`
- `round_off` stays invoice-level only — NOT added to line items
- Migrations: `20260612000001_ap14_invoice_line_items_gst_split.sql`, `20260612000002_ap14_save_invoice_draft_gst_split.sql`

**RPC signature change:**
- Old signature (8 args) was DROPped before CREATE OR REPLACE to avoid overload ambiguity
- New signature adds: `p_cgst int4 DEFAULT 0`, `p_sgst int4 DEFAULT 0`, `p_igst int4 DEFAULT 0`, `p_round_off int4 DEFAULT 0`, `p_is_interstate boolean DEFAULT false`, `p_gst_enabled boolean DEFAULT true`
- All new params appended AFTER p_line_items (supabase-js uses named args so order is not positional-critical)
- SECURITY INVOKER, SET search_path = public, pg_temp — preserved
- Per-line: reads cgst/sgst/igst from jsonb with `coalesce((v_line->>'cgst')::int4, 0)` for safety
- Return payload now includes all invoice-level and per-line split fields

**Action wiring:**
- `gstEnabled = false`, `isInterstate = false` remain hardcoded at the call site (flag SOURCING is AP-14 next unit)
- Per-line lineItemsPayload now includes cgst/sgst/igst from `totals.lines[idx]`
- RPC call passes p_cgst/p_sgst/p_igst/p_round_off/p_is_interstate/p_gst_enabled
- SaveInvoiceDraftRow interface extended with all new fields
- SaveDraftResult/SavedDraftLine extended: roundOff (not round_off), isInterstate, gstEnabled (camelCase)

**Types:**
- `src/lib/types/database.ts` regenerated — invoice_line_items Row/Insert/Update now has cgst/sgst/igst
- `save_invoice_draft` Args in database.ts includes all 14 named params

**Key deviation:** old signature had to be explicitly DROPped (not just OR REPLACED) because Postgres treats different argument lists as separate overloads. The REVOKE on the old signature was issued first, then DROP, then CREATE OR REPLACE.

**Round-trip evidence confirmed:**
- intra-state: cgst+sgst=tax_total, igst=0 — PASS
- inter-state: igst=tax_total, cgst=sgst=0 — PASS
- gst_enabled=false: all splits 0, tax_total=0 — PASS
- negative round_off: subtotal+tax_total+round_off=total — PASS
- AC6: Σ line cgst/sgst/igst = invoice cgst/sgst/igst — PASS

**Limitation:** auth.uid() cannot be set in execute_sql (no JWT context) — membership guard in RPC was not exercisable via direct SQL; verified by code inspection (unchanged from AP-13).

**Why:** Per-line splits are needed for PDF/pay-page line breakdowns. Invoice-level splits already existed; this unit makes them persistable end-to-end.

**How to apply:** The next AP-14 unit (flag sourcing) only needs to change the two hardcoded constants in actions.ts and add the business/customer fetch — no schema changes needed.
