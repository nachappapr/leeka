# Connection Pooling — ArthaPatra

This document describes ArthaPatra's database connection architecture, the measured pooling posture as of 2026-06-13, and guidance for any future work that introduces a direct Postgres connection (migration tooling, scripts, bulk operations).

---

## 1. Current architecture — HTTP-only, zero direct Postgres connections

ArthaPatra makes **no direct TCP connections to Postgres**. Every database operation goes through the Supabase HTTP stack:

```
Next.js app  →  supabase-js (HTTPS)  →  PostgREST / Auth / Storage  →  Postgres
```

The four client files that establish all database access:

| File                         | Role                                     | Key                                     |
| ---------------------------- | ---------------------------------------- | --------------------------------------- |
| `src/lib/supabase/client.ts` | Browser Client Component                 | publishable (anon) key                  |
| `src/lib/supabase/server.ts` | RSC, Server Actions, Route Handlers      | publishable (anon) key + cookie session |
| `src/lib/supabase/admin.ts`  | Service-role (server-only, bypasses RLS) | service-role key                        |
| `src/lib/supabase/proxy.ts`  | Middleware session refresh               | publishable (anon) key                  |

Environment variables (`src/lib/env.server.ts`):

- `NEXT_PUBLIC_SUPABASE_URL` — the project's HTTPS REST endpoint
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key (server-only, never `NEXT_PUBLIC_`)

There is **no `DATABASE_URL`**, no `pg` driver import, and no ORM in the codebase. All supabase-js calls resolve to HTTP requests against `https://lnzsizporrvdzlpxysfd.supabase.co/rest/v1/`, `/auth/v1/`, or `/storage/v1/`.

### Why this means Supavisor is not in the runtime request path

Supavisor (and its predecessor PgBouncer) pools native Postgres TCP connections — the binary wire protocol on port 5432 or 6543. Because ArthaPatra never opens a TCP connection to Postgres, Supavisor is not in the path for any HTTP request the app makes. PostgREST (the REST API layer that handles `/rest/v1/` calls) manages its own internal connection pool to Postgres server-side, and Supabase operates that pool — no configuration is required from the application.

**No runtime code change is needed to satisfy the PRD §4 and §11 Supavisor pooling requirement.** The HTTP-only architecture is the correct and intentional choice for serverless deployments.

---

## 2. Measured pooling posture — verified 2026-06-13

All measurements taken against Supabase project `lnzsizporrvdzlpxysfd` (ArthaPatra, ap-south-1) via Supabase MCP `execute_sql`.

### 2.1 API endpoint

```
https://lnzsizporrvdzlpxysfd.supabase.co
```

(from `mcp__supabase__get_project_url`)

### 2.2 Connection limits

```sql
show max_connections;
-- max_connections: 60
```

```sql
select setting from pg_settings where name = 'superuser_reserved_connections';
-- setting: 3
```

Effective connections available to application roles: `60 - 3 = 57`.

### 2.3 Connection census

```sql
select coalesce(application_name,'') as app, state, count(*)
from pg_stat_activity
group by 1,2
order by 3 desc;
```

| app                      | state  | count |
| ------------------------ | ------ | ----- |
| (walsender / bg workers) | null   | 6     |
| pg_net 0.20.3            | idle   | 1     |
| pg_cron scheduler        | null   | 1     |
| mgmt-api                 | active | 1     |
| postgrest                | idle   | 1     |
| postgres_exporter        | idle   | 1     |
| (anonymous)              | idle   | 1     |

Null-state rows are background workers (autovacuum, logical replication, WAL sender, etc.) — they do not consume application connection slots.

### 2.4 Headroom

```sql
select
  (select count(*) from pg_stat_activity) as in_use,
  current_setting('max_connections')::int as max_conn,
  current_setting('max_connections')::int
    - (select count(*) from pg_stat_activity)::int as headroom;
```

| in_use | max_conn | headroom |
| ------ | -------- | -------- |
| 12     | 60       | 48       |

**12 connections in use out of 60 (48 free).** The application contributes zero connections beyond the Supabase-managed PostgREST idle slot. The db tier is the Free tier (60 max connections); posture is healthy.

### 2.5 Advisor findings (security + performance)

`mcp__supabase__get_advisors` — **no connection-related findings in either category**.

Pre-existing findings (unrelated to this unit, not acted on here):

**Security — WARN:**

- `get_public_invoice` and `get_reports_metrics` flagged as `SECURITY DEFINER` callable by `anon` / `authenticated` roles. Both are intentional by design (AP-9, AP-34 respectively).
- `create_business` flagged as `SECURITY DEFINER` callable by `authenticated`. Intentional (AP-6).
- `auth_leaked_password_protection` — leaked password protection disabled. Pre-existing, tracked separately.

**Performance — INFO:**

- Several indexes flagged as unused (`invoices_created_by_idx`, `notifications_user_id_idx`, `payments_recorded_by_idx`, `customers_business_name_idx`, `invoices_overdue_sweep_idx`, `invoice_events_business_type_created_idx`, `invoices_reminder_candidate_idx`). Pre-existing; newly created indexes on a fresh project will show as unused until the query planner has exercised them.
- `invoices_customer_id_fkey` — unindexed foreign key. Pre-existing, tracked separately.

None of these findings were introduced by this unit.

---

## 3. Supavisor connection strings — for future direct-Postgres tooling only

These strings are **not consumed by the app today**. Use them only if you add direct Postgres access for migration tooling, one-off scripts, an ORM, or bulk data operations.

The project is in `ap-south-1` (AWS). The shared Supavisor pooler for this region is:

```
aws-ap-southeast-1.pooler.supabase.com
```

> Note: Supabase maps `ap-south-1` (Mumbai) to the `ap-southeast-1` pooler cluster. Confirm the exact host in your Supabase dashboard under **Project Settings → Database → Connection string** before using these strings in any tooling.

### 3.1 Transaction mode (port 6543) — recommended for serverless / scripts

```
postgres://postgres.lnzsizporrvdzlpxysfd:[YOUR-PASSWORD]@aws-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 3.2 Session mode (port 5432) — for long-lived persistent connections

```
postgres://postgres.lnzsizporrvdzlpxysfd:[YOUR-PASSWORD]@aws-ap-southeast-1.pooler.supabase.com:5432/postgres
```

The username format is `postgres.<project-ref>` — the project reference is embedded in the username, not just the hostname, so Supavisor can route the connection to the correct tenant.

Replace `[YOUR-PASSWORD]` with the database password from **Supabase Dashboard → Project Settings → Database → Database password**. Never commit the real password to this file or any config file.

---

## 4. Transaction mode vs session mode

| Concern                 | Transaction mode (6543)                                                                                                                                                                                                                                                                                                                                                                                      | Session mode (5432)                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **How it works**        | Each transaction is dispatched to a pooled server connection; the connection is returned to the pool immediately after `COMMIT`/`ROLLBACK`.                                                                                                                                                                                                                                                                  | Each client session holds a dedicated server connection for its lifetime.                                            |
| **Best for**            | Serverless functions, short-lived scripts, cron jobs, edge functions — any caller that opens and closes connections frequently.                                                                                                                                                                                                                                                                              | Long-running backend processes, ORMs that rely on session-level state, tools that use advisory locks or `SET LOCAL`. |
| **Prepared statements** | **Not supported.** Prepared statements require a persistent server connection. If your driver or ORM uses prepared statements (e.g. Prisma's default query engine, pg's `prepare`), you must disable them. For Prisma: add `?pgbouncer=true&statement_cache_size=0` to the connection string (or set `directUrl` to the session-mode string). For `node-postgres`: use `{prepared: false}` in query options. | Fully supported.                                                                                                     |
| **Session-level state** | No — `SET LOCAL`, advisory locks, and `LISTEN`/`NOTIFY` are dropped between transactions.                                                                                                                                                                                                                                                                                                                    | Yes — session state persists for the connection lifetime.                                                            |
| **`COPY`**              | Generally avoid via transaction mode; use session mode or direct connection.                                                                                                                                                                                                                                                                                                                                 | Supported.                                                                                                           |

**Recommendation for any future direct-PG work:** use transaction mode (6543) for serverless workloads and cron scripts. Use session mode (5432) for local migration runs (`supabase db push`, `supabase migration up`) or any tooling that sets session parameters. Use the direct connection (`db.lnzsizporrvdzlpxysfd.supabase.co:5432`) for `pg_dump` / `pg_restore`.

---

## 5. Vercel serverless and Fluid Compute implications

Vercel serverless functions are ephemeral: each invocation may run in a fresh process with no connection state carried over. This is exactly the workload Supavisor transaction mode is designed for.

**Why the current HTTP-only architecture is safe under serverless load:**

- supabase-js opens HTTPS connections through the Vercel edge network to the Supabase REST API. These are short-lived HTTP/1.1 or HTTP/2 requests — no TCP connection to Postgres is kept open between requests.
- PostgREST maintains its own server-side connection pool to Postgres. Supabase provisions and tunes this pool per project tier. At the Free tier (60 max_connections), PostgREST typically holds 2–5 idle connections and scales up on demand within the limit.
- Under serverless burst (many concurrent Vercel invocations), each invocation makes independent HTTPS calls. There is no risk of the Vercel layer exhausting Postgres connections because there are no Postgres connections from Vercel.

**If direct Postgres is ever introduced** (e.g. an ORM, a bulk-import edge function, a background job), the risk changes:

| Vercel concurrency          | Direct-PG connections opened | Risk                                                                            |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| 1–10                        | 1–10                         | Low — within Free tier headroom                                                 |
| 50+                         | 50+                          | High — approaches max_connections=60; connection errors (SQLSTATE 53300) likely |
| Any, via Supavisor txn mode | ~2–5 pooled                  | Safe — pooler reuses connections across all concurrent callers                  |

The safe pattern if direct PG is introduced: always use the Supavisor transaction-mode string (port 6543) in Vercel functions. Never use the direct connection string in a serverless context.

---

## 6. Load-test verification (formal load test deferred)

The acceptance criterion for AP-44 is "no connection exhaustion under load test." A formal load test against the production deployment is deferred until the invoices UI is wired to live data (currently mock-data gated). These are the exact reproduction instructions:

### 6.1 Target route

The heaviest read route is the dashboard summary: `GET /dashboard` (triggers `get_dashboard_summary` RPC + customer/invoice list reads). As a secondary target, `GET /invoices` exercises the invoice list query.

### 6.2 k6 script outline

```js
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "https://app.arthapatra.in";

// Replace with a valid session cookie from a real authenticated session.
const SESSION_COOKIE = "sb-lnzsizporrvdzlpxysfd-auth-token=<your-token>";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp up to 20 VUs
    { duration: "60s", target: 50 }, // hold at 50 VUs (simulates burst)
    { duration: "30s", target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // < 1% error rate
    http_req_duration: ["p(95)<2000"], // p95 < 2s
  },
};

export default function () {
  const params = { headers: { Cookie: SESSION_COOKIE } };
  const res = http.get(`${BASE_URL}/dashboard`, params);
  check(res, { "status is 200 or 307": (r) => r.status === 200 || r.status === 307 });
  sleep(1);
}
```

Run with: `k6 run load-test.js`

### 6.3 Monitoring query — run during the load test

Open a Supabase SQL editor tab and poll this query every 10 seconds while the load test runs:

```sql
select
  (select count(*) from pg_stat_activity)                  as total_connections,
  current_setting('max_connections')::int                   as max_conn,
  current_setting('max_connections')::int
    - (select count(*) from pg_stat_activity)::int          as headroom,
  (select count(*) from pg_stat_activity
   where state = 'active')                                  as active_queries,
  (select count(*) from pg_stat_activity
   where wait_event_type = 'Lock')                          as lock_waits;
```

### 6.4 Pass criteria

- `total_connections` stays below 55 (leaves 5-connection buffer from the 60 max).
- No Postgres error `53300 too_many_connections` in Supabase logs (`get_logs` during or after the run).
- k6 `http_req_failed` rate below 1%.
- k6 `http_req_duration` p95 below 2 seconds.

---

## 7. Verified stamp

Measured on **2026-06-13** against project `lnzsizporrvdzlpxysfd` (ArthaPatra, ap-south-1, Free tier):

- `max_connections`: **60**
- `superuser_reserved_connections`: **3**
- Total connections in use: **12** (all Supabase-managed infrastructure; zero app-originated direct connections)
- Headroom: **48 free connections**
- Connection-related advisor findings: **none**
- App architecture: **HTTP-only (supabase-js → HTTPS → PostgREST)** — Supavisor not in the runtime request path; no runtime config change required
