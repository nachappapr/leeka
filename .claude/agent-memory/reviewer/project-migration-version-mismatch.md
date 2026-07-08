---
name: project-migration-version-mismatch
description: Recurring pattern — local migration filename timestamp differs from the remotely-applied version; supabase db push/pull will drift or re-apply
metadata:
  type: project
---

First seen in AP-2: local filename `20260610032034` vs remote-recorded `20260610032202`. Recurred on the customer-search unit (2026-07-08): `20260708120000_list_customers_page_security_definer.sql` was recorded remotely as `20260708045407`, and the very next migration `20260708130000_list_customers_page_search.sql` was recorded remotely as `20260708054617`. Both times the backend-engineer authored the filename with `supabase migration new`-style local timestamps, but the actual `apply_migration` MCP call stamped a different (usually earlier-in-the-day) version on the remote `supabase_migrations.schema_migrations` table.

**Why:** `supabase db push` / `db pull` use the filename timestamp as the reconciliation key against the remote migrations table. A mismatch makes the remote think the local file is unapplied (risk of re-run under `--include-all`) or produces phantom drift on `db pull`. Functionally the mutations here happened to be idempotent (`drop function if exists` + `create or replace`), so no runtime break occurred — but that won't always be true (e.g. a bare `create table` or `alter table add column` would fail loudly on re-apply).

**How to apply:** For every migration-adding unit, cross-check `mcp__supabase__list_migrations` against the local filename timestamp before signing off. If they differ and the file is still uncommitted, this is a cheap Medium finding: fix direction is to rename the local file to the remote-assigned version. If the mismatched file is already committed to `main` from a prior unit, treat it as baked-in/out-of-scope for the current review — don't re-flag it, just note it as context so the still-fixable file in the current diff doesn't get missed. This has now happened at least twice in the same feature chain (`list_customers_page` migrations), so call it out explicitly as a process gap for backend-engineer (likely applying via MCP at a different wall-clock moment than when the filename was chosen) rather than a one-off.
