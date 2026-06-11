---
name: project-ap8-tenant-tables
description: AP-8 settled decisions — all tenant tables, RLS patterns, index patterns, get_advisors findings
metadata:
  type: project
---

## Settled decisions from AP-8 (completed 2026-06-11)

**10 tenant tables created (all with RLS ON):**
- customers, items, invoices, invoice_line_items, payments, invoice_sequences,
  invoice_events, message_log, notifications, reminder_rules

**invoice_status enum:**
- Values: 'draft','sent','viewed','partial','pending','paid','overdue','cancelled'
- 'pending' added for UI StatusPillStatus; 'cancelled' from PRD

**Money columns:** always integer paise (never float/numeric for money)

**RLS pattern (binding for all new tenant tables):**
- Use `(select auth.uid())` not bare `auth.uid()` in every policy — the advisor flags
  bare `auth.uid()` as `auth_rls_initplan` WARN (per-row re-evaluation)
- Standard 4 policies per table: read/insert/update/delete for authenticated + restrictive anon deny
- Anchor: `business_id in (select business_id from business_members where user_id = (select auth.uid()))`
- invoice_line_items: access via invoice join (no direct business_id)

**notifications special case:**
- Has both business_id (tenant) and user_id (addressee)
- Two SELECT policies for same role = `multiple_permissive_policies` WARN
- Fix: merge into one policy with OR clause:
  `business_id in (...) or user_id = (select auth.uid())`

**Grants:**
- `authenticated`: full SELECT/INSERT/UPDATE/DELETE on all tenant tables
- `anon`: nothing (revoke after grant)

**Indexes spec vs actual:**
- Spec provides indexes on high-cardinality FKs + query patterns
- Supabase advisor additionally flags: invoice_events.invoice_id, invoices.created_by,
  message_log.business_id+invoice_id, notifications.business_id+user_id,
  payments.business_id+recorded_by
- invoices_customer_id_fkey: advisor says unindexed, but composite
  `invoices(business_id, customer_id)` covers it — known advisor limitation, not a real gap

**get_advisors known WARNs (pre-existing, not from AP-8):**
- `authenticated_security_definer_function_executable` on `create_business` — intentional
- `auth_leaked_password_protection` — phone OTP project, no password auth

**Migration versions:**
- `20260611220000` — all tables + initial policies
- `20260611220001` — policy fix (select auth.uid()) + missing FK indexes + notifications merge

**Why:** `(select auth.uid())` wrapping is a Supabase-specific performance requirement —
Postgres evaluates bare `auth.uid()` once per row, but wrapping in a subselect forces
it to be evaluated once per query. This is critical at scale.

**How to apply:** Every future tenant table migration must use `(select auth.uid())` in
all RLS policies. Check for multiple SELECT policies on same table/role and merge with OR.
