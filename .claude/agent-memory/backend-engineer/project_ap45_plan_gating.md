---
name: ap45-plan-gating
description: AP-45 Free vs Pro gating — plan helper, GST export gate, atomic invoice cap
type: project
---

AP-45 shipped 2026-06-13. Three sub-units:

**SUB-UNIT 1 — plan helper:** `src/lib/plan/plan.server.ts`  
`import "server-only"`. Exports `getPlan(businessId?) → 'free'|'pro'` and `isPro(businessId?) → boolean`.  
Fail-closed: any lookup error returns 'free' (never accidentally grants Pro).  
Refactored `settings/actions.ts` `updateReminderSettings` inline plan check to `isPro(businessId)`.

**SUB-UNIT 2 — GST export gate:** `src/app/api/invoices/export/csv/route.ts`  
After businessId lookup, calls `isPro(businessId)`. If not Pro → `Response.json({ ok:false, error:"GST export is a Pro feature" }, { status: 403 })`. Frontend must branch on status 403.

**SUB-UNIT 3 — Atomic invoice cap:** Migration `20260613200000_ap45_issue_invoice_plan_cap.sql`  
- Partial index: `ap45_issued_not_null_business_sent_at_idx ON invoices(business_id, sent_at) WHERE sent_at IS NOT NULL`  
- `issue_invoice` RPC extended: reads `businesses.plan` → if not 'pro', counts `sent_at IS NOT NULL` in current IST calendar month → rejects if >= 5 with `'free plan invoice cap reached'`.  
- IST boundary: `date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata')::date` — AP-20/AP-33 precedent.  
- Why `sent_at` not `issue_date`: `issue_date` is user-supplied and can be backdated; `sent_at` is server-set to `now()` at issue time.  
- Atomicity: plan SELECT + count + number draw share the same implicit plpgsql transaction. No TOCTOU window.  
- Error mapped in `issueInvoice` action: `msg.includes("free plan invoice cap reached")` → user-facing upgrade message.

**SUB-UNIT 4 — Reminder gate inventory (no code):**  
- `settings/actions.ts` `updateReminderSettings`: Pro gate on enabling (consolidated to isPro() in SU1).  
- `claim_due_reminders` cron: defence-in-depth plan='pro' check — untouched (correct).  
- `invoices/actions.ts` `sendReminder`: intentionally ALL-TIERS per PRD §10 — confirmed, no gate added.

**EXPLAIN ANALYZE result:** Index Only Scan on `ap45_issued_not_null_business_sent_at_idx`, Execution Time: 0.780 ms.  
**GRANT:** authenticated + postgres + service_role on issue_invoice; anon/public absent.  
**get_advisors:** no new Critical/High; all WARNs pre-existing (AP-9, AP-6, AP-34).

**Why:** businesses.plan is TEXT (not enum) in the schema — `=== 'pro'` is a safe comparison; helper uses `=== "pro" ? "pro" : "free"` so future plan values default to 'free'.

**How to apply:** when gating any new Pro feature: import `isPro` from `@/lib/plan/plan.server` (server-only); call with businessId; return 403 or appropriate error if not pro.

**FOLLOW-UP:** home.ts `PRICING_PLANS` says "Up to 10 invoices per month" but the enforced cap is 5. The copy needs updating to match the resolved spec.
