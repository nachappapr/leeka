---
name: cache-invalidation-invoices
description: invoices list RPCs switched DEFINER + revalidateBusiness helper; webhook businessId gap
type: project
---

## Cache-compatibility migration for list_invoices_page + invoice_status_counts

**Why:** invoices list read path runs in `use cache` (no auth session), calls RPCs via service-role admin client. auth.uid() is NULL → old INVOKER + membership subquery returned zero rows.

**What was done:**
- `supabase/migrations/20260621110000_list_invoices_page_security_definer.sql` — INVOKER→DEFINER, dropped auth.uid() membership subquery, plain `where i.business_id = p_business_id`, grant to service_role only
- `supabase/migrations/20260621120000_invoice_status_counts_security_definer.sql` — DROP no-arg fn, CREATE p_business_id uuid variant, DEFINER, grant service_role only
- `src/lib/cache/revalidate-business.ts` — new helper: `updateTag(dashboardTag) + updateTag(invoicesTag)` in one call
- `src/app/(app)/invoices/actions.ts` — 7 mutation actions now call `revalidateBusiness(businessId)` (saveInvoiceDraft, issueInvoice, recordPayment, markInvoicePaid, cancelInvoice, duplicateInvoice, deleteInvoice); old `updateTag`/`dashboardTag` imports removed

**Webhook businessId gap (FOLLOW-UP, NOT done):**
`whatsapp/webhook` and `email/webhook` call `mark_message_status` / `mark_email_status` RPCs which return only `{ message_found, invoice_transitioned }` — no business_id in result. Adding revalidation would require either extending RPC return types (new migration) or an extra DB query in the route handler. Both are out-of-scope for this unit. Razorpay webhook changes subscription plan, not invoice status — no revalidation needed. Pay/UPI route is read-only.

**Pattern established:** service_role-only DEFINER RPCs get `revoke execute ... from public, anon, authenticated; grant execute ... to service_role;`

**How to apply:** prod migration apply + type regen awaits user authorization. Migrations are in place on disk, verified via rolled-back execute_sql transaction on main project (branch creation was unavailable — CLI unauthenticated, MCP confirm_cost tool not registered).
