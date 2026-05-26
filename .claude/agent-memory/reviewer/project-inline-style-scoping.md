---
name: project-inline-style-scoping
description: ESLint no-restricted-syntax (inline style) rule is scoped to src/app/** and src/components/**, but ignores src/components/ui/**. Files inside ui/ can use inline style for data-driven values without a disable comment.
metadata:
  type: project
---

The `no-restricted-syntax` rule for `JSXAttribute[name.name='style']` in `eslint.config.mjs` has `ignores: ["src/components/ui/**"]`. This means any file under `src/components/ui/` — including custom/ wrappers — may use inline `style` for data-driven values without an `// eslint-disable-next-line` comment. No disable comment is needed in those files; requiring one would be a false finding.

**Why:** Confirmed in `eslint.config.mjs` lines 75-87. The rule targets `src/app/**/*.tsx` and `src/components/**/*.tsx` but explicitly ignores `src/components/ui/**`.

**How to apply:** When reviewing a file under `src/components/ui/custom/` that uses `style={{ width: \`${n}%\` }}` or similar, do NOT flag the absence of a disable comment. Only flag it if the file is under `src/app/` and lacks the disable comment.
