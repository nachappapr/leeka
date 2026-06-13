---
name: project-ap43-bundle-budget
description: AP-43 bundle budget — Turbopack vs webpack analyzer distinction, measured chunk sizes, pre-existing type error in invoice.ts
type: project
---

AP-43 shipped 2026-06-13: `@next/bundle-analyzer` wired in `next.config.ts`, `docs/bundle-budget.md` created.

Key findings:
- `@next/bundle-analyzer` (webpack plugin) is NOT compatible with Turbopack builds. `ANALYZE=true pnpm build` warns and skips report generation. The correct tool is `pnpm next experimental-analyze` (Turbopack native, v16.1+). Both are documented in `docs/bundle-budget.md`.
- Turbopack does NOT print a per-route first-load-JS size column in `pnpm build` output. Use `pnpm next experimental-analyze --output` for size data; results land in `.next/diagnostics/analyze/`.
- Measured shared framework baseline (rootMainFiles gz): 129 KB. Well under the 130 KB budget.
- All routes pass their budgets as measured from `page_client-reference-manifest.js` chunk sums.
- Recharts lazy chunk: `static/chunks/03xx.wch.kslw.js` (343 KB raw / 96 KB gz), referenced only in `.next/server/app/(app)/reports/page/react-loadable-manifest.json`.
- Pre-existing type error in `src/lib/data/invoice.ts:198` (AP-42 backend work, `Parameters<typeof supabase.rpc<"list_invoices_page">>[1]` typed as `undefined`). Outside AP-43 scope; must be fixed by backend-engineer AP-42.

**Why:** Turbopack does not ship a webpack-compatible plugin interface; the two analyzers are distinct tools. Future CI gate is a follow-up.

**How to apply:** When working on bundle analysis tasks, always use `pnpm next experimental-analyze` for Turbopack builds. `@next/bundle-analyzer` requires `--webpack` flag and is Turbopack-incompatible without it.
