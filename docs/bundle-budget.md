# ArthaPatra — First-Load JS Bundle Budget

**Epic:** AP-43 — Caching & bundle budget  
**Goal:** Keep first-load JavaScript lean enough for quick loads on 3G/4G connections.

---

## How to measure

**Turbopack build (default, recommended):**

```bash
pnpm next experimental-analyze --output
```

Results land in `.next/diagnostics/analyze/`. Open `.next/diagnostics/analyze/index.html` in a browser for the interactive treemap and import-chain view, or run without `--output` to open it directly.

**Webpack build (for `@next/bundle-analyzer` treemap):**

```bash
ANALYZE=true pnpm build --webpack
```

> Note: `@next/bundle-analyzer` (the webpack plugin now wired into `next.config.ts`) is **not compatible with Turbopack** and emits a warning when `ANALYZE=true pnpm build` runs without `--webpack`. For this Turbopack project, prefer `pnpm next experimental-analyze`. The `@next/bundle-analyzer` wiring is retained for future webpack fallback and CI compatibility.

**For a quick route list:**

```bash
pnpm build
```

Turbopack suppresses the per-route first-load-JS size column that classic webpack builds print. Use the analyzer commands above to get size data.

---

## Per-route first-load JS budget

Budgets are expressed as **gzip-compressed first-load JS in kilobytes (KB)**. Recharts is excluded from every route's budget — see the footnote.

| Route                       | Budget (KB gz) | Measured (KB gz) [^1] | Status |
| --------------------------- | -------------- | --------------------- | ------ |
| Shared / framework baseline | ≤ 130          | 129                   | PASS   |
| `/dashboard`                | ≤ 230          | 189 [^2]              | PASS   |
| `/invoices`                 | ≤ 230          | 204 [^2]              | PASS   |
| `/invoices/[id]`            | ≤ 230          | 131 [^2]              | PASS   |
| `/customers`                | ≤ 230          | 143 [^2]              | PASS   |
| `/reports`                  | ≤ 230          | 132 [^2]              | PASS   |
| `/activity`                 | ≤ 230          | 125 [^2]              | PASS   |
| `/pay/[token]`              | ≤ 230          | 35 [^2]               | PASS   |
| `/auth`                     | ≤ 230          | 113 [^2]              | PASS   |
| `/invoices/new`             | ≤ 260          | 238 [^2]              | PASS   |
| `/invoices/[id]/edit`       | ≤ 260          | 238 [^2]              | PASS   |
| `/settings`                 | ≤ 260          | 241 [^2]              | PASS   |

**Recharts (lazy chunk, deferred off all first-load):** 343 KB raw / 96 KB gz — loads only on `/reports` user interaction, after `next/dynamic` resolves. Excluded from every row above.

[^1]: Measured from `pnpm build` on 2026-06-13 (Next.js 16.2.6, Turbopack). Shared baseline = sum of `rootMainFiles` from `.next/build-manifest.json`, gzip level 9. Per-route figures = sum of chunks listed in each route's `page_client-reference-manifest.js` (excluding the recharts lazy chunk `03xx.wch.kslw.js`), gzip level 9. These manifests list every Client Component chunk the route _can_ load, making these upper bounds on first-visit cost. Turbopack produces heavily-shared chunks; the actual incremental download for a returning visitor who has cached shared chunks will be lower. The webpack per-route column (`pnpm build --webpack`) would show a tighter preload-only footprint. A CI gate based on the Turbopack analyzer output is a follow-up.

[^2]: Route-specific chunk gz only (does not include the 129 KB shared framework baseline, which is the same for all routes and cached after first visit to any route).

---

## Recharts isolation verification

Recharts compiles to exactly one isolated chunk that is referenced **only** in the reports route's loadable manifest:

```
.next/server/app/(app)/reports/page/react-loadable-manifest.json
```

Content confirms:

```json
{
  "63316": {
    "id": 63316,
    "files": ["static/chunks/03xx.wch.kslw.js"]
  }
}
```

The chunk `static/chunks/03xx.wch.kslw.js` (343 KB raw / 96 KB gz) is absent from every other route's client-reference-manifest and from `rootMainFiles`. It loads only when the `ReportsChartLazy` dynamic import resolves on `/reports`.

---

## Enforcement

Budgets are checked manually at review time against `pnpm next experimental-analyze` or `ANALYZE=true pnpm build --webpack` output. There is no automated CI bundle-size gate yet — adding one is a parked follow-up (AP-43 FOLLOW-UP: wire bundle-size CI gate, e.g. `bundlewatch` or a GitHub Actions step that fails on regression).

The shared baseline budget of 130 KB gz is the primary guard: if it regresses (e.g. a new global import), every route exceeds its budget simultaneously. Watch `rootMainFiles` in `.next/build-manifest.json`.
