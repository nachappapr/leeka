---
name: supabase-mcp-no-branching
description: Supabase MCP branch tools are non-functional in this env; DB-unit evidence must run on the main project with explicit user authorization
metadata:
  type: project
---

The Supabase MCP server in lekka has NO working branch isolation. `create_branch` requires a `confirm_cost_id` from a `confirm_cost` tool that is not exposed, and `list_branches`/branch ops fail with "Project reference is missing when validating permissions". Only the single project (ref `lnzsizporrvdzlpxysfd`) is reachable. `execute_sql`, `apply_migration`, `get_advisors`, `list_migrations` DO work against that main project.

**Why:** The DB-unit safety rule wants apply_migration + EXPLAIN ANALYZE + get_advisors evidence on a *branch* before merge. That path is environmentally unavailable as of AP-13 (2026-06-12). Prior DB units (AP-9/10/12) were applied directly to the single dev project.

**How to apply:** For any backend-engineer DB unit, do NOT spend cycles trying to create a branch — it will fail. Instead, surface the choice to the user at the handoff: (A) user applies the migration via Supabase CLI/dashboard, then the agent runs read-only evidence (execute_sql round-trips, EXPLAIN ANALYZE, get_advisors, GRANT check) against the result; or (B) user explicitly authorizes applying the migration directly to the main dev project, after which the agent applies + runs the full evidence suite. Applying to the shared dev DB is a human decision — never auto-authorize Option B mid-unit. This is a dev project, not production.
