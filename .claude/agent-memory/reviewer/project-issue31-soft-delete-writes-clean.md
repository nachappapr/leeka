---
name: issue31-soft-delete-writes-clean
description: Issue #31 customer soft-delete search filters + write guards reviewed clean; int4/integer signature equivalence note
type: project
---

`supabase/migrations/20260708200000_customer_soft_delete_search_and_write_guards.sql`
(2026-07-08) reviewed PASS. Byte-level diff against each function's prior
definition (`20260611230002` search_customers, `20260612191606` search_all,
`20260628020000` save_invoice_draft, `20260614100000` upsert_customer)
confirmed every body matches exactly except the stated one-line/one-block edit
per function. GRANT/REVOKE signatures, SECURITY INVOKER, and `search_path`
all identical to prior. No RETURNS TABLE OUT-column collision risk — the new
guards reference `id`/`deleted_at`, neither of which is an OUT column name in
`save_invoice_draft`'s `RETURNS TABLE(invoice_id, status, subtotal, ...)`.

**Non-issue worth remembering:** the new migration writes `p_subtotal int4`
etc. where the prior `save_invoice_draft` definition (from issue #9's
20260628020000) wrote `p_subtotal integer`. These are the same Postgres type
(`int4` is `integer`'s internal name) — `CREATE OR REPLACE FUNCTION` accepts
this as an identical signature, not a new overload. Don't flag this as a
signature drift; confirm by checking the OID / running `\df` or trusting that
`integer`/`int4`/`int` are interchangeable spellings before raising an alarm.

**Why:** [[returns_table_column_qualify]] governs the 42702 rule — this unit
is a clean example of a new guard clause that legitimately does NOT need
table-qualification because it touches no OUT-column-shadowed names, so
"every column ref must be qualified" isn't a blanket rule — it's "every
column ref that could shadow an OUT column."

**How to apply:** when diffing a reproduced RPC body against its prior
definition for issue #31-style units, extract both bodies to temp files and
run `diff -b` (case/whitespace insensitive) rather than eyeballing — it
catches drift precisely and confirms clean reproductions fast.
