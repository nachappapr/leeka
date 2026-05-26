---
name: project-card-wrapper-headerless
description: Card wrapper in src/components/ui/custom/card.tsx has required title prop — no headerless mode; raw divs that replicate its visual contract are High #2 violations
metadata:
  type: project
---

`src/components/ui/custom/card.tsx` exports `Card` with `title: string` as a required prop and always renders the header bar. There is no headerless/title-optional mode.

Feature code that needs the card's visual shell (`rounded-2xl bg-card shadow-card`) but no title header cannot use `Card` and may reach for a raw `<div>` instead. That raw `<div>` is a High #2 (wrapper-over-primitives) violation — the visual contract is duplicated outside the design system wrapper.

**Fix direction:** Add `title?: string` (or a `noHeader` variant) to `Card` so headerless usage can still go through the wrapper. Then feature code consumes `Card` with no title prop.

**How to apply:** Any raw `<div className="... rounded-2xl bg-card shadow-card ...">` in feature code is a strong signal that `Card` was bypassed. Flag High #2 and direct the fix toward extending `Card`.
