---
name: project-returns-boolean-sidesteps-42702
description: Mutation RPCs that only need a success signal use `returns boolean` instead of `RETURNS TABLE`, deliberately avoiding the OUT-column 42702 qualification trap
metadata:
  type: project
---

Seen first in `delete_customer` (issue #30 backend, `supabase/migrations/20260707100000_customer_soft_delete.sql`): a soft-delete RPC that only needs to signal success returns `boolean` (via `return found;` after the `update`) rather than `RETURNS TABLE`. The migration's own header comment calls this out explicitly as sidestepping the OUT-column / unqualified-reference 42702 trap documented in [[project-notification-mutation-user-scoping]]-era migrations (originally `20260628020000`).

**Why:** `RETURNS TABLE` OUT-column names enter the function body's scope, so any unqualified reference inside a `plpgsql`/`sql` body can collide and throw Postgres 42702 at runtime — a class of bug `tsc`/lint cannot see (this is checklist item #5, RETURNS TABLE column qualification). Simple mutation RPCs (delete/toggle/mark-status) that don't need to return row data avoid the whole class of bug by not using `RETURNS TABLE` at all.

**How to apply:** When reviewing a new mutation RPC, if it returns `boolean`/`void`/a scalar instead of `RETURNS TABLE`, checklist item #5 doesn't apply — don't flag it for missing table-qualification, and don't ask "why isn't this qualified", since there are no OUT-columns to qualify. Only apply the qualification check when the function genuinely uses `RETURNS TABLE` with column refs in the body (e.g. `list_customers_page`, `list_invoices_page`).
