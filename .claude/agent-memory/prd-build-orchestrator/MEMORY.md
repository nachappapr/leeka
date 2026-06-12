# Memory index

- [Supabase project](supabase-project.md) — ArthaPatra project ref lnzsizporrvdzlpxysfd, URL, keys, MCP endpoint; service-role key is manual-only
- [Supabase MCP no branching](supabase-mcp-no-branching.md) — branch tools dead in this env; DB-unit evidence runs on main project, only with explicit user authorization (Option A/B)
- [AP-13 tsc resolver errors — RESOLVED](project-ap13-tsc-precommit-gate-broken.md) — FIXED via schema split in AP-13 Unit 3; check-types clean at HEAD (verified 2026-06-12). Do NOT assume main is tsc-dirty.
- [AP-14 GST engine — CLOSED](project-ap14-gst-engine.md) — all 3 units approved 2026-06-12 (compute, persistence, flag-sourcing).
- [AP-15 Live preview parity — CLOSED](project-ap15-live-preview-parity.md) — both units approved 2026-06-12; preview==persisted verified in-app, PDF + pay-page parity legs deferred to their own epics.
- [AP-16 Invoice numbering — CLOSED](project-ap16-invoice-numbering.md) — Epic 6; all 3 units approved 2026-06-12, story-completion gate passed, committed 075ef3f, tree clean, advisors clean of AP-16; FY format YYYY-YY confirmed
- [AP-17 Issue invoice — CLOSED](project-ap17-issue-invoice.md) — Epic 7; satisfied by AP-16's issue_invoice RPC + issueInvoice action; PDF half of AC deferred to AP-21 (Option A, 2026-06-12). Do NOT re-open over stale PRD checkbox.
- [Epic 7 Lifecycle & Payments — CLOSED](project-epic7-lifecycle-payments.md) — AP-17/18/19/20 all approved 2026-06-12; AP-20 deviations (GET cron, IST boundary) ratified; next = Epic 8 / AP-21 PDF
- [Epic 9 — CLOSED for v1](project-epic9-pay-link.md) — AP-22/AP-23 approved 2026-06-12; AP-24 SKIPPED for v1 (open question #1 resolved: manual mark-paid only); PDF→Epic 8, edge-cache→AP-43; coral traps; PayCard ratified
- [Shared UI wrappers are frozen](feedback-shared-ui-immutable.md) — never modify ui/custom wrappers for one feature; build a feature-local variant (AP-23 Card lesson)
