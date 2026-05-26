---
name: input-textarea-focus-ring-fail
description: InputField and TextareaField focus rings use ring-ring/50 (#f46a39 at 50% opacity) = ~1.73:1 on bg-card; fails WCAG 2.4.11; fix ring-coral-press throughout
metadata:
  type: project
---

`InputField` (via `Input` primitive) and `TextareaField` (via `Textarea` primitive) both carry `focus-visible:ring-3 focus-visible:ring-ring/50`. The `--ring` token = `#f46a39` (coral); at 50% opacity on `bg-card` (#ffffff) the effective colour is approximately #fbb4a0, yielding ~1.73:1 contrast — well below the 3:1 floor for focus indicators (WCAG 2.4.11, AA in WCAG 2.2).

**Why:** `--ring: #f46a39` is the global ring token inherited from shadcn; the /50 opacity halving is also from the shadcn default. Both primitives adopted this verbatim without adapting to Lekka's bg-card baseline.

**How to apply:** On every audit pass that touches a form with InputField/TextareaField, flag the focus ring. The fix is to add `focus-visible:ring-coral-press` to the component's className or to patch the primitive. `--color-coral-press: #d9531f` on bg-card (#ffffff) = 4.03:1 — passes 3:1. This is a static CSS change; no client boundary cost. [[bare-button-focus-ring]]

Note: Desktop table InputFields in invoice-edit-items-table.tsx apply `focus-visible:ring-0` + `border-0` which is an even worse case (zero indicator) — see separate Critical finding in the Unit B audit.
