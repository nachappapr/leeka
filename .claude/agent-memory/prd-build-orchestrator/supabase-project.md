---
name: supabase-project
description: ArthaPatra Supabase project ref, URL, keys location, and MCP wiring for Epic 0 AP-2 onward
metadata:
  type: reference
---

ArthaPatra's Supabase project is provisioned and MCP-wired.

- Project ref: `lnzsizporrvdzlpxysfd`
- API URL: `https://lnzsizporrvdzlpxysfd.supabase.co`
- MCP endpoint: `https://mcp.supabase.com/mcp?project_ref=lnzsizporrvdzlpxysfd` (project-scoped). Load Supabase MCP tools via ToolSearch `select:mcp__supabase__...`.
- Publishable key: `sb_publishable_tA0s1Wx3e_S2QjPK_afdCA_e9NAUuFE` (modern, preferred). Legacy anon JWT also available.
- Service-role key is NOT retrievable via MCP (no tool) — user must paste it into `.env.local` manually; agents leave a marked placeholder + follow-up.

**Why:** Project was provisioned by the user out-of-band; ref/URL/keys aren't derivable from repo state and are needed for every DB unit.
**How to apply:** For any AP-2+ DB unit, use these MCP tools for real verification evidence (list_migrations, list_tables, get_advisors). Do not create a new project. Env vars consumed by [[supabase-env-vars]] scaffolding in src/lib/env.server.ts + env.client.ts.
