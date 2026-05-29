---
name: project-fieldlabel-duplicate
description: Private FieldLabel re-implementation in feature code when a shared wrapper already exists in ui/custom/field-label.tsx
metadata:
  type: project
---

A private `FieldLabel` div was re-implemented in `src/components/invoices/export-invoices-modal.tsx` (line 75) when `src/components/ui/custom/field-label.tsx` already exports a `FieldLabel` component. The private version renders a `<div>` while the shared wrapper renders a semantic `<label>`. The shared wrapper also already uses the same Tailwind classes (`text-label font-bold text-ink-2`).

**Why:** Feature code must consume wrappers from `@/components/ui` (rule #2). Re-implementing a private version with the same name as an existing shared component creates drift and uses the semantically wrong element for form field labeling.

**How to apply:** Any time a feature file defines a private helper named after an existing ui/custom export, flag as High #2. Fix direction: delete the private implementation, import from `@/components/ui/custom/field-label`. Note that `field-label.tsx` renders a `<label>` element — if a `<div>` is genuinely needed for non-form section headers, the fix is to add a variant to the shared wrapper, not inline a private re-implementation.
