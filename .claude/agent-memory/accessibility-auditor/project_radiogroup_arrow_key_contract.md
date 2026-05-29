---
name: radiogroup-arrow-key-contract
description: APG Radio Group requires single tab stop + arrow-key navigation; multiple button[role=radio] each with their own tab stop is a Critical violation
type: project
---

The APG Radio Group pattern requires:
- A single `tabIndex={0}` on the currently selected (or first) radio; all others `tabIndex={-1}` (roving tabIndex)
- `ArrowDown`/`ArrowUp` (or `ArrowRight`/`ArrowLeft`) on the `role="radiogroup"` container to move selection and focus
- `Home`/`End` to jump to first/last
- `Tab` and `Shift+Tab` leave the group entirely
- `Space` activates the focused radio

A common mistake is to render each radio as a separate `<button>` with default tab order. This creates N tab stops inside the group, which screen readers announce as a broken pattern and keyboard users must Tab through instead of arrow through.

**Why:** Screen readers (JAWS, NVDA) implement arrow-key virtual navigation for `role="radio"` groups by design. When that contract is absent, the AT can mis-announce count, selection state, and navigation instructions.

**Fix:** Add `onKeyDown` to the `role="radiogroup"` container handling `ArrowDown`/`ArrowUp`. Set `tabIndex={active ? 0 : -1}` as a prop on each radio element. Move focus programmatically to the new active radio ref on arrow key. Space/Enter/click still call the same selection handler.

**How to apply:** Any time `role="radio"` elements appear in a `role="radiogroup"` and each has `tabIndex={0}` by default (i.e. they are `<button>` elements not explicitly given `tabIndex={-1}`), flag Critical. The fix is always the roving-tabIndex + arrow-key handler pattern. Already client components — no boundary cost.
