---
name: reports-chart-restyle-issue39-clean
description: Reports chart card-restyle diff (#39, on top of #38 core restyle) reviewed clean — dual-XAxis overlap trick, CHART_SERIES single-source-of-truth, and skeleton-duplicates-Card-classes pattern all confirmed acceptable
type: project
---

Reviewed `git diff e5269ea -- src/components/reports src/lib/reports src/lib/__tests__/reports-chart-format.test.ts`
(issue #39, reports chart card-framed overlapped bars). Verdict: PASS, no findings.

Confirmed patterns worth remembering:

1. **Skeleton placeholders duplicating Card's classes instead of importing the Card wrapper is
   established, accepted precedent in this codebase** — `MetricCardSkeleton` (pre-existing,
   unmodified) in `reports-skeleton.tsx` already does `rounded-xl bg-card p-5 shadow-card` inline
   rather than wrapping in `<Card>`. The new chart-block skeleton in the same file extends the same
   pattern (`rounded-xl bg-card p-4 shadow-card`). Do NOT flag this as a #2 wrapper-consumption
   violation — `Card`'s primitive is a plain styled `<div>` (no semantic landmark, no required a11y
   plumbing), and `aria-hidden` skeleton placeholders in this repo consistently skip the wrapper.
   Only flag if a *feature* (non-skeleton) surface reimplements Card's classes.

2. **Presentational sub-components with no `'use client'` directive, imported only by an already
   `'use client'` parent, are correct as-is** — `reports-chart-legend.tsx` and
   `reports-chart-tooltip.tsx` have no hooks/events and no directive; they're pulled into the client
   bundle by import-chain transitivity from `reports-chart.tsx`. This is the same confirmed pattern
   as [[project-no-use-client-rides-parent-boundary]] — don't ask for a directive here.

3. **A doc comment on a non-obvious Recharts trick is justified**, e.g. the two-`<XAxis>` overlap
   comment in `reports-chart.tsx` (`xAxisId="back"`/`"front"` so two `Bar`s can center-overlap in
   one category band) and the `CHART_SERIES` ordering-invariant comment in `chart-format.ts`
   (single array drives bar stacking order + legend + tooltip so they can't diverge). Both explain
   a genuinely non-obvious invariant, not a restatement of the code — keep this bar high but these
   two clear it.

4. Tailwind v4 spacing is formula-driven (n × 0.25rem for any integer n), so classes like `h-108`,
   `h-92`, `h-78`, `h-64`, `min-w-32` are canonical scale values, not arbitrary — do not flag large
   height numbers as `bg-[...]`-style violations just because they look unusual.
