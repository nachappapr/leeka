---
name: project-auth-server-actions
description: Auth Server Actions pattern — sendOtp/verifyOtp in src/lib/actions/auth.ts, called via useTransition from client flow component
metadata:
  type: project
---

Phone OTP auth wired in Epic 1 AP-4 (2026-06-10).

Server Actions live at `src/lib/actions/auth.ts` (not `src/app/actions/`) — lib-level because they're called from a Client Component via `useTransition`, not a form action attribute.

**Why:** `src/app/actions/` would be a valid convention too, but `src/lib/actions/` keeps auth logic decoupled from the route tree and is consistent with the existing `src/lib/supabase/` pattern.

**How to apply:** Future auth mutations (sign-out, profile update) should go into `src/lib/actions/auth.ts` or a sibling `src/lib/actions/<domain>.ts`.

Key patterns established:
- `createClient()` from `@/lib/supabase/server` works correctly from Server Actions (cookies are written to the response)
- `useTransition` + Server Actions for async mutations in Client Components — no separate loading state boolean needed
- `AuthActionResult = { ok: true } | { ok: false; error: string }` discriminated union for Server Action results
- `text-overdue` is the project's semantic error/destructive text color (not `text-danger` or `text-red-*`)
- Supabase phone OTP: `signInWithOtp({ phone: '+91XXXXXXXXXX' })` and `verifyOtp({ phone, token, type: 'sms' })`
- Test OTP config in `supabase/config.toml` under `[auth.sms.test_otp]` — key is phone without + sign as string
