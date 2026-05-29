---
name: project-flex-arbitrary-escapes-lint
description: flex-[N] arbitrary Tailwind values are not caught by no-restricted-classes; only spacing/color/typography/radius patterns are banned
metadata:
  type: project
---

`flex-[1.4]` (and similar fractional flex-grow values) slip through the ESLint `better-tailwindcss/no-restricted-classes` rule because the pattern only covers hex colors, spacing (p/px/py/w/h/gap/etc.), typography (text/leading/tracking), and border-radius. Arbitrary `flex-[N]` escapes lint.

**Why:** The ESLint no-restricted-classes config restricts only the four categories above. `flex-[...]` has no Tailwind canonical equivalent for fractional values, but the correct fix is to use `flex-1` + `flex-2` or equal widths via `w-*` instead of fractional flex-grow. First seen in `dash-sort-sheet.tsx:88` (`flex-[1.4]` on the Apply button).

**How to apply:** Flag `flex-[N]` arbitrary values as Medium #13 violations. Fix direction: redesign the button layout to use canonical `flex-1` / `w-*` fractions rather than arbitrary flex-grow ratios.
