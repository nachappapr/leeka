---
name: project-security-definer-use-cache-rpc-pattern
description: SECURITY DEFINER + service_role-only grant is the correct pattern for RPCs read exclusively via admin client inside "use cache" functions — not a Critical #3/#4 violation on its own
type: project
---

Repeated pattern (list_invoices_page 20260621110000, list_customers_page
20260708120000): a paginated read RPC starts as SECURITY INVOKER with an
`auth.uid()` / business_members membership guard in the function body. Once
the read path moves into a Next.js `"use cache"` function (no request
context, no Supabase auth session), the RPC is called via
`createAdminClient()` (service-role), so `auth.uid()` is always NULL and the
invoker-mode guard silently zeroes out every result. The fix migration:

- Switches the function to `security definer` with `set search_path = ''`
- Removes the `auth.uid()` / membership subquery from the function body
- `revoke execute ... from public, anon, authenticated`
- `grant execute ... to service_role` only

**Why this is OK, not a Critical #3/#4 finding:** authorization moves to the
call site, not away entirely. The `businessId` passed into the cached
function is resolved server-side, pre-cache-boundary, via
`resolveBusinessId(supabase)` (cookie-scoped client, `auth.getUser()` +
`business_members` lookup) in a Server Component/Server Action that runs
*before* entering the `"use cache"` scope. Only the server ever calls the
RPC, and only with a verified `businessId`. No anon/authenticated grant path
exists, so a compromised or malicious client cannot invoke the definer
function directly even without the in-body guard.

**How to apply:** when reviewing a migration that converts a list/read RPC
from SECURITY INVOKER to SECURITY DEFINER for `"use cache"` compatibility,
check three things instead of reflexively flagging Critical:
1. `revoke execute ... from public, anon, authenticated` is present and
   covers the exact function signature being replaced.
2. `grant execute ... to service_role` is the only grant.
3. The caller (`src/lib/data/<feature>.ts`) uses `createAdminClient()` inside
   the cached function, and the `businessId` argument traces back to a
   `resolveBusinessId`-style server-side auth check performed *before* the
   cache boundary — not from an unverified client input.
If all three hold, this is the established, accepted trust model — PASS it.
If the RPC is reachable from a Client Component or `NEXT_PUBLIC_*` context,
or the grant list includes `authenticated`/`anon`, that's still Critical.
