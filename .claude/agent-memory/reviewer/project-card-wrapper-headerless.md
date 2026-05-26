---
name: project-card-wrapper-headerless
description: Card wrapper in src/components/ui/custom/card.tsx has optional title — headerless mode exists; raw elements replicating its visual contract are High #2 violations
metadata:
  type: project
---

`src/components/ui/custom/card.tsx` exports `Card` with `title?: string` (optional) and conditionally renders the header bar only when `title` or `action` is present. A headerless card surface is fully supported — pass no title prop and only the shell (`rounded-2xl bg-card shadow-card overflow-hidden`) renders.

Feature code that needs the card visual shell but no title header **must still go through `Card`** — it accepts a `className` prop for custom padding (e.g. `className="p-8 max-mobile:p-4.5"`).

A raw `<div>` or `<article>` with `rounded-2xl bg-card shadow-card` in feature code is a High #2 bypass even though headerless mode exists.

**Fix direction:** Replace `<article className="rounded-2xl bg-card p-8 shadow-card ...">` with `<Card className="p-8 max-mobile:p-4.5">` — no title prop needed.

**Note on element semantics:** `Card` wraps `CardPrimitive` which renders a `<div>`. If `<article>` is semantically required (e.g. a self-contained document surface), the fix is to add an `asChild`/`as` prop to `Card` or accept `article` semantics via `CardPrimitive`. That's a follow-up wrapper extension, not a reason to bypass the wrapper.

**How to apply:** Any `<div>` or `<article>` in feature code with `rounded-2xl bg-card shadow-card` (individually or combined) that is not consuming `Card` is a High #2 violation.

**Updated:** 2026-05-26 — title was made optional at commit 42283c6; stale "title required" note removed.
