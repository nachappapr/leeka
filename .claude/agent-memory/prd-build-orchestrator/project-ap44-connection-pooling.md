---
name: project-ap44-connection-pooling
description: AP-44 Supavisor pooling (Epic 17) CLOSED 2026-06-13 — verification+doc unit; app is intentionally HTTP-only (zero direct PG); formal load test deferred
metadata:
  type: project
---

AP-44 "Connection pooling" (Epic 17 — Performance & Mobile) closed 2026-06-13. Single unit, pre-approved end-to-end run (no per-unit human gate), UNCOMMITTED — main conversation owns commit + Notion.

Key facts:
- The app makes ZERO direct Postgres connections — all access is supabase-js over HTTPS (src/lib/supabase/client.ts, server.ts, admin.ts, proxy.ts). Supavisor is NOT in the runtime request path; this is correct and intentional. Do not "fix" it.
- Unit shipped: docs/connection-pooling.md (runbook) + commented-out DATABASE_URL_TRANSACTION/DATABASE_URL_SESSION entries in .env.example (placeholders only, not consumed by code).
- Measured posture (2026-06-13): max_connections=60, superuser_reserved=3, in_use=12 (all Supabase infra), headroom=48. Free-tier ceiling — refresh numbers if tier upgrades.
- Pooler convention: aws-[REGION].pooler.supabase.com, txn mode 6543 (no prepared statements), session 5432, user postgres.lnzsizporrvdzlpxysfd. Exact pooler subdomain only visible in dashboard Connect panel.
- AC "no connection exhaustion under load test": formal k6/artillery test DEFERRED until invoices UI leaves mock data; repro script + monitoring query + pass criteria documented in docs/connection-pooling.md §6.
- Parked follow-ups: unindexed invoices_customer_id_fkey (perf INFO advisor) and auth leaked-password protection (security WARN) — pre-existing, for a hardening pass.

**Why:** Epic 17 ran as parallel sibling stories in one working dir; AP-44's fence was docs/* + .env.example only.
**How to apply:** if asked to "configure Supavisor" again or add DATABASE_URL, point to docs/connection-pooling.md — the architecture decision is already made and documented. Re-open only if direct PG access (ORM/scripts/bulk ops) is actually introduced.
