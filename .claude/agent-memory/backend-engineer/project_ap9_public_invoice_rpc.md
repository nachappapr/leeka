---
name: project-ap9-public-invoice-rpc
description: AP-9 settled decisions — public_token trigger, get_public_invoice RPC, viewed side-effect, gen_random_bytes path
metadata:
  type: project
---

## Settled decisions from AP-9 (completed 2026-06-11)

**Migration versions:**
- `20260611230000` — trigger function + RPC initial (had gen_random_bytes path bug)
- `20260611230001` — fix: search_path includes `extensions` for gen_random_bytes; trigger to SECURITY INVOKER

**gen_random_bytes location:**
- Lives in `extensions` schema, NOT `public`
- Any function using it must have `set search_path = public, extensions, pg_temp`
- Bare `search_path = public, pg_temp` will get `ERROR: function gen_random_bytes(integer) does not exist`

**Trigger function pattern:**
- Trigger functions do NOT need SECURITY DEFINER — they run as the invoking session
- Use SECURITY INVOKER for trigger functions to avoid advisor warnings
- REVOKE EXECUTE FROM public/anon/authenticated on trigger functions (not callable directly)

**get_public_invoice RPC:**
- SECURITY DEFINER, search_path = public, extensions, pg_temp
- Returns jsonb (not composite type) — simplest for the JS client
- Redacts: notes, customer phone/email/billing_address/gstin, business owner_id/address/state_code/plan
- Rejects: draft, cancelled, null/empty token → returns null
- Side-effect: first view of 'sent' invoice → status='viewed', viewed_at=now(), invoice_events row (type='viewed', channel='web')
- v_status_out variable captures the post-flip status before building the response

**get_advisors known WARNs introduced by AP-9 (intentional):**
- `anon_security_definer_function_executable` on `get_public_invoice` — intentional, public API for unauthenticated customers
- `authenticated_security_definer_function_executable` on `get_public_invoice` — same function, authenticated path also OK

**Pre-existing WARNs (not from AP-9):**
- `authenticated_security_definer_function_executable` on `create_business` — AP-6 intentional
- `auth_leaked_password_protection` — phone OTP project, no password auth

**Why:** The public invoice link is the customer-facing view surface — anon access is by design. The advisor WARN for get_public_invoice is expected and documented here.

**How to apply:** For future public-access RPCs (e.g. payment landing page), follow the same pattern: SECURITY DEFINER + explicit REVOKE FROM PUBLIC + GRANT TO anon. Document the intentional advisor WARN in the migration comment and here.
