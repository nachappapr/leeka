---
name: project-globals-css-type-scale
description: Responsive type scale refactor (--fs-* tokens + @media overrides) was added to globals.css inside a modal/component unit without explicit approval
metadata:
  type: project
---

In the Export Invoices modal unit, globals.css received a responsive typography token refactor:
- Two new semantic tokens: `--text-lead` / `--fs-lead` (19px desktop, 17px mobile) and `--text-money-sm` / `--fs-money-sm` (28px desktop, 24px mobile)
- Existing hardcoded pixel values (e.g. `--text-h1: 48px`) were refactored to `var(--fs-h1)` with the concrete value moved to `:root`
- A new `@media (max-width: 768px)` block with mobile overrides for all `--fs-*` variables

None of these tokens were consumed by any file in the unit. This is a type system infrastructure change bundled into a UI component unit.

**Why:** Rule #12 and AGENTS.md rule 1 both require explicit approval before adding to globals.css. The responsive scale is clearly designed work but should be a separate approved unit.

**How to apply:** Any globals.css diff that adds tokens not consumed by the unit's own files is High #12 scope creep. Flag and require a standalone approval pass or a separate committed unit. The pattern of bundling type-system refactors inside unrelated units is recurring.
