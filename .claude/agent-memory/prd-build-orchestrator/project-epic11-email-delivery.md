---
name: project-epic11-email-delivery
description: Epic 11 Email Delivery — AP-28 (send + tracking) approved & DB-applied 2026-06-12; story-completion gate is env-gated (Resend creds + invoices UI), analogous to Epic 10
metadata:
  type: project
---

Epic 11 — Email Delivery for ArthaPatra. Single story AP-28 (Email send + tracking). Code human-APPROVED 2026-06-12; migration applied to MAIN project (lnzsizporrvdzlpxysfd) under explicit Option-A authorization same day. Unit recorded complete.

**Why:** Email is the second delivery channel after WhatsApp (Epic 10). `mark_email_status` RPC deliberately mirrors AP-26's `mark_message_status`: provider_msg_id lookup on the shared global partial unique index `message_log_provider_msg_id_idx` (no new index), no-downgrade rank guard (sent=1/delivered=2/opened=3), opened→viewed invoice transition with channel='email', bounce = terminal 'failed' + owner notification row. service_role-only EXECUTE, SECURITY DEFINER, locked search_path.

**How to apply:**
- AP-28 DB evidence is real and on file: apply `{"success":true}`; EXPLAIN ANALYZE proved Index Scan on `message_log_provider_msg_id_idx` (seqscan disabled to prove usability on empty table); GRANT = service_role + postgres owner only (anon/authenticated/PUBLIC absent); advisors zero new findings vs baseline (4 security + 8 perf pre-existing, unchanged). Do NOT re-run the gate or re-apply.
- Story-completion gate is NOT self-certified and is ENV-GATED like Epic 10: live email send is blocked on Resend (or chosen provider) API creds + the bounce/open webhook needing a public deployment URL, AND on the invoices list/detail UI leaving mock data so a real invoiceUuid flows through. Real-device test + Lighthouse + one-by-one AC verification remain human-confirmed.
- Pre-existing advisor findings (invoices_customer_id_fkey unindexed FK; 7 unused indexes; get_public_invoice intentional anon WARN from AP-9) are parked, not Epic 11 regressions.
- Uncommitted at close: AP-28 impl files (api/email/, lib/email/, schema/email.ts, types/email-webhook.ts, env.server.ts, actions.ts, send.ts) + migration + database.ts type swap. Commit on user request.
