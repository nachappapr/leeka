---
name: project-ap20-overdue-sweep
description: AP-20 settled decisions — sweep_overdue_invoices RPC, partial index, cron route handler, vercel.json
metadata:
  type: project
---

## Settled decisions from AP-20 (completed 2026-06-12)

**RPC `sweep_overdue_invoices()` → jsonb:**
- `SECURITY INVOKER`, `set search_path TO 'public', 'pg_temp'`
- IST date boundary: `due_date < (now() AT TIME ZONE 'Asia/Kolkata')::date`
- Returns `{ swept_count: int, invoice_ids: uuid[] }`
- Uses writable CTE pattern (not UPDATE-in-subquery — plpgsql syntax error; not RETURNING...INTO array — captures only last row)
- GRANT EXECUTE: `service_role` only. REVOKE from PUBLIC, anon, authenticated.
- Emits one `invoice_events` row (type='overdue', meta has due_date) and one `notifications` row (type='invoice_overdue', addressed to businesses.owner_id) per flipped invoice.

**Partial index `invoices_overdue_sweep_idx`:**
- `ON public.invoices (due_date) WHERE status IN ('sent', 'viewed')`
- Covers the sweep predicate exactly. Dev DB shows seq scan (6 rows — expected); will use index at production scale.

**plpgsql pattern learned:**
- `SELECT ARRAY_AGG(id) INTO v_ids FROM (UPDATE ... RETURNING id) AS t` — FAILS with syntax error at 'SET' in plpgsql.
- Correct pattern: writable CTE `WITH upd AS (UPDATE ... RETURNING id) SELECT ARRAY_AGG(id) INTO v_ids FROM upd`.
- RETURNING...INTO scalar on multi-row UPDATE only captures the last row — always use ARRAY_AGG via CTE for multi-row results.

**Route handler `/api/cron/overdue-sweep/route.ts`:**
- Exports both POST (PRD) and GET (Vercel Cron compatibility).
- Auth: `Authorization: Bearer ${process.env.CRON_SECRET}` — direct process.env (not serverEnv) since it's runtime auth, not startup validation.
- Uses `createAdminClient()` (server-only, service-role).
- Logs via pino: `logger.info(...)` on success, `logger.error({ err: { code, message } }, ...)` on failure.
- No Zod needed (empty-body cron handler).

**vercel.json:**
- Created at repo root: `{ "crons": [{ "path": "/api/cron/overdue-sweep", "schedule": "30 19 * * *" }] }`
- Schedule: 30 19 * * * UTC = 01:00 IST (shortly after IST midnight).

**Types:**
- `SweepOverdueRow { swept_count: number; invoice_ids: string[] }` added to `src/lib/types/lifecycle.ts`.
- `database.ts` regenerated: `sweep_overdue_invoices: { Args: never; Returns: Json }`.

**CRON_SECRET env var:**
- Must be set in Vercel env vars (not in NEXT_PUBLIC_*).
- Used in the route handler's bearer auth guard.
- Not added to env.server.ts Zod schema — it's runtime auth, not startup validation.

**Why:** SECURITY INVOKER chosen over DEFINER because service_role bypasses RLS either way; INVOKER is safer default for a cron-context RPC with no auth.uid().

**How to apply:** Future cron RPCs follow the same GRANT-to-service_role-only pattern. Always use the writable CTE `WITH upd AS (UPDATE...RETURNING)` pattern in plpgsql when capturing multiple-row UPDATE results.
