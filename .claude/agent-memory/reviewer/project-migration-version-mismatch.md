---
name: project-migration-version-mismatch
description: AP-2 local migration filename (20260610032034) differs from remotely-applied version (20260610032202); supabase db push will fail reconciliation
metadata:
  type: project
---

In AP-2 the backend-engineer ran `supabase migration new` which assigned timestamp `20260610032034` as the local filename, but the remote apply (via MCP) executed at a later moment and Supabase recorded it as `20260610032202`. The two timestamps are permanently out of sync.

**Why:** `supabase db push` and `supabase db pull` use the migration filename timestamp as the reconciliation key against the `supabase_migrations.schema_migrations` table on the remote. A mismatch means the local file is invisible to the remote history (Supabase will see `032034` as unapplied and try to re-run it, or `--include-all` will re-apply it).

**How to apply:** When reviewing future migration PRs, always verify that the local filename timestamp matches what Supabase registered remotely. The fix pattern is: rename the local file to match the remote timestamp (e.g. `20260610032202_...sql`), update any schema_version seed value inside, and re-run `supabase db pull` to confirm no drift.
