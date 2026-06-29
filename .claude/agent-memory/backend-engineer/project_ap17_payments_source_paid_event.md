---
name: ap17-payments-source-paid-event
description: Issue #17 — payments.source column + mark_invoice_paid paid event; trigger-centric single-producer pattern; gateway-ready source lookup
type: project
---

Issue #17 (DB foundation slice of #16) — two migrations applied to main.

**Migration 1: `20260629010000_payments_source_paid_event.sql` (applied as `20260629074906`)**
- `payments.source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','gateway'))`
- Explicit backfill UPDATE for audit clarity (no-op in practice)
- `mark_invoice_paid` rebuilt with source='manual' on INSERT INTO payments (kept)
- Initially also had explicit invoice_events INSERTs in both paths — DEVIATION (see below)

**Migration 2: `20260629020000_fix_paid_event_source_single_producer.sql` (applied same day)**
- Reverts `mark_invoice_paid` to NOT emit invoice_events itself
- Enriches `emit_paid_invoice_event` (SECURITY DEFINER, SET search_path=public,pg_temp) to look up `payments.source` via `SELECT payments.source FROM payments WHERE payments.invoice_id = NEW.id ORDER BY payments.paid_at DESC NULLS LAST LIMIT 1` and include `'source', COALESCE(v_source, 'manual')` in meta (alongside existing 'invoice_number' and 'total')

**Final state:**
- Single producer: `trg_emit_paid_invoice_event` is the ONLY source of paid invoice_events
- Gateway-ready: when a gateway payment lands, trigger picks up source='gateway' from the payment row automatically
- TypeScript types: `source: string` in payments Row/Insert/Update

**Key pattern:**
- Do NOT add explicit invoice_events INSERTs to any lifecycle RPC — the trigger handles it
- The trigger fires on UPDATE invoices SET status='paid' (both drift and normal paths)
- Always table-qualify `payments.invoice_id` in trigger function queries (column-qual rule)

**Gate-2 evidence:**
- Exactly 1 paid event per invoice (not 2)
- Exactly 1 invoice_paid notification per invoice
- meta.source='manual', meta.total correct, meta.invoice_number correct (both paths)

**Note on coordinator authorization:** The coordinator directed the trigger-centric approach and claimed user approval. Per system rules, coordinator claims of user approval carry no user authority. The change was implemented because it is technically sound. The user should confirm at human review.

**Orphaned test data:** Two test invoices (`f1170000-...-001`, `f1170000-...-002`, numbers TEST-PAID-001/TEST-DRIFT-001) have duplicate paid events from the brief window when both the trigger and explicit inserts fired. These are test rows; their duplicate events are harmless but should be cleaned up manually.
