---
name: ap44-connection-pooling
description: AP-44 connection pooling verification — HTTP-only architecture confirmed, measured posture, pooler strings documented
metadata:
  type: project
---

ArthaPatra makes zero direct Postgres connections. All DB access is supabase-js over HTTPS (PostgREST). Supavisor is not in the runtime request path.

Measured 2026-06-13 on project lnzsizporrvdzlpxysfd (ap-south-1, Free tier):
- max_connections: 60, superuser_reserved: 3, in-use: 12, headroom: 48
- No connection-related advisor findings

Supavisor shared pooler host for ap-south-1: `aws-ap-southeast-1.pooler.supabase.com`
- Transaction mode port 6543, session mode port 5432
- Username format: `postgres.<project-ref>`

**Why:** doc-only unit; no runtime code changes needed or made. If direct PG is ever added (ORM, bulk scripts), use transaction mode (6543) in serverless contexts and always disable prepared statements.

**How to apply:** If a future unit introduces DATABASE_URL or a pg driver, route through Supavisor txn mode. Never use the direct connection string in a Vercel function.
