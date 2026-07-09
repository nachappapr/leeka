---
name: ap43-profiles-language-check
description: Issue #43 — narrowed profiles.language CHECK constraint from 6 locales to (en, hi, kn)
type: project
---

Migration `supabase/migrations/20260709100000_ap43_tighten_profiles_language_check.sql`, applied directly to the main project (branch tooling still unavailable this session — `list_branches` errored "Project reference is missing when validating permissions"; same standing Option-B gap as [[project_issue30_customer_soft_delete]] and [[project_issue_customers_search_rpc]]).

- Defensive `update ... where language not in ('en','hi','kn')` before the constraint swap — confirmed 0 rows affected (all 3 existing profile rows were already `'en'`).
- `drop constraint if exists profiles_language_check` + re-`add constraint` narrowed to `check (language in ('en','hi','kn'))`. Was previously `('en','hi','ta','mr','bn','gu')` from AP-5 ([[project_ap5_profiles]]).
- Verified via `execute_sql` with `begin; update ...; rollback;` probes (no branch, so used transactions instead of a disposable branch to avoid leaving test rows): old constraint rejected `kn` (23514) before the migration; new constraint accepts `kn` and rejects `ta` (23514) after.
- `get_advisors` (security + performance) both clean relative to this migration — all listed findings are pre-existing and unrelated (get_public_invoice/create_business/get_reports_metrics SECURITY DEFINER WARNs, leaked-password WARN, unused-index INFOs elsewhere).

**How to apply:** Any future Locale-set change (e.g. adding a 4th language) must update this same CHECK constraint plus the app's `Locale` type/union in TS — grep `profiles_language_check` first to find the live definition rather than assuming the AP-5 migration file is current (this repo has a pattern of superseding CHECK/constraint definitions in later migrations rather than editing the original file).
