---
name: issue31-customer-soft-delete-writes
description: Issue #31 — deleted-customer exclusion in search_customers/search_all + refusal guards in save_invoice_draft/upsert_customer
type: project
---

Backend unit for issue #31 (2026-07-08), completing the frontend half of PRD #23
customer soft delete started in [[project_issue30_customer_soft_delete]].

**Migration:** `supabase/migrations/20260708200000_customer_soft_delete_search_and_write_guards.sql`,
applied directly to main (branch tooling still dead — same `confirm_cost_id`
gap recorded in [[project_issue30_customer_soft_delete]]; re-confirmed by
attempting `create_branch` directly, which returns "Cost confirmation ID does
not match the expected cost of creating a branch" with no `confirm_cost` tool
registered).

**Drift trap that cost a failed `apply_migration` call:** the issue's own
"check these migrations" pointers for `save_invoice_draft` (20260612000000,
20260612000002) were stale. Issue #9
(20260628010000_lifecycle_rpcs_returns_table.sql +
20260628020000_lifecycle_rpcs_qualify_column_refs.sql) had since rewritten
`save_invoice_draft` from `RETURNS jsonb` to `RETURNS TABLE(...)` as part of a
7-function lifecycle-RPC pass (same migration also touched `issue_invoice`,
`record_payment`, `mark_invoice_paid`, `cancel_invoice`, `duplicate_invoice`,
`delete_invoice`). Reproducing the jsonb-returning shape and adding the new
guard hit `42P13: cannot change return type of existing function`. **Lesson:
always confirm the live signature with
`select pg_get_function_result(oid) from pg_proc where proname = '<fn>'`
before writing a CREATE OR REPLACE — grep on migration filenames/function name
strings can miss a broader rewrite migration whose filename doesn't mention the
function** (`lifecycle_rpcs_returns_table.sql` doesn't contain the string
`save_invoice_draft` in its name). Also: `apply_migration` runs the whole
migration file as one transaction — a late statement erroring rolls back
every earlier CREATE OR REPLACE in the same file too, so a partial-success
read of `pg_proc` after a failed apply is not reliable; re-query and confirm
zero drift before re-applying.

**The four changes, confirmed via `execute_sql` on main using the
`SET LOCAL role authenticated; select set_config('request.jwt.claims', ...)`
trick** (test fixtures under business `b0000000-0000-0000-0000-000000000001`
"Test Biz AP9" / user `a9000000-0000-0000-0000-000000000001`, cleaned up
after):

1. `search_customers` — added `and c.deleted_at is null`. Confirmed: a query
   matching both an active and a soft-deleted customer returns only the active
   one post-delete.
2. `search_all` — added `and c.deleted_at is null` to BOTH customer branches
   (idle-state recent-customers query and the active name/phone search query).
   The two invoice branches (idle + active) are untouched on purpose — a test
   invoice pinned to the soft-deleted customer still surfaced
   `customer_name: "Issue31 DeletedCust"` in the invoice-kind results after the
   delete, while the customer-kind results correctly dropped that same
   customer. This asymmetry is the acceptance criterion, not a bug.
3. `save_invoice_draft` — new guard `if p_customer_id is not null and exists
   (select 1 from public.customers where id = p_customer_id and deleted_at is
   not null) then raise exception 'cannot attach a deleted customer to this
   invoice'`, placed before the INSERT/UPDATE branch so it covers both a new
   draft and a stale-tab re-save of an existing one. Confirmed refusing both
   paths. Message text deliberately avoids the substrings
   (`"not a member"`, `"not a draft"`, `"not found"`) that
   `src/app/(app)/invoices/actions.ts`'s local `mapSaveDraftError` special-cases
   by `.includes(...)` — using "not found" would have mislabeled this as
   "Invoice not found" in the UI, which is wrong (it's the customer, not the
   invoice). Falls through to that helper's existing generic fallback string
   instead. No TypeScript touched.
4. `upsert_customer` — added `and deleted_at is null` to the existing
   UPDATE-path `not exists` ownership check, so a soft-deleted row now hits the
   pre-existing `raise exception 'customer not found in this business'` path
   verbatim. `src/app/(app)/customers/actions.ts`'s `upsertCustomerAction`
   doesn't inspect `error.message` at all (every RPC error already collapses to
   one generic client string), so this was a zero-touch client contract by
   construction — confirmed by reading the action before writing the SQL, not
   after. INSERT path confirmed still works with the same phone number as a
   just-deleted customer (no unique constraint on `customers.phone`, per
   [[project_issue30_customer_soft_delete]]).

**Error-handling landscape (useful for any future issue touching these two
actions):** `upsertCustomerAction` has zero message/code inspection — any RPC
error becomes the hardcoded `"Failed to save customer. Please try again."`.
`invoices/actions.ts` has one local `map<Action>Error` substring-matcher per
lifecycle action (`mapSaveDraftError`, `mapRecordPaymentError`, etc.) — no
shared helper. Before raising any new RPC exception text in either surface,
grep the relevant action file for its `map*Error` function (or absence of one)
to know whether the new message will actually reach the user or silently
collapse to a generic string.

**No new `get_advisors` findings** (security or performance) from this unit —
pre-existing WARNs (SECURITY DEFINER anon/authenticated-executable functions,
leaked-password-protection) and INFOs (unindexed FK, unused indexes) are all
unrelated to the four touched functions, which are all SECURITY INVOKER.
