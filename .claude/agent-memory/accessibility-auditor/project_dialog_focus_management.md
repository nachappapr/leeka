---
name: dialog-focus-management
description: Hand-rolled dialog/drawer without Base UI: missing focus trap, focus-on-open, and focus-restore are all Critical APG Dialog violations
metadata:
  type: project
---

When a component implements `role="dialog"` manually (not via Base UI Dialog/Sheet/Popover), the APG Dialog pattern requires THREE focus behaviours — all absent from the first home-drawer attempt:

1. **Focus-on-open**: On open, call `.focus()` on the close button or first interactive element inside the dialog. Wire via `useEffect([open])` + a `ref` on the target.
2. **Focus trap**: While open, `Tab` and `Shift+Tab` must cycle only within focusable elements inside the dialog. Implement with a `useFocusTrap` hook or by querying all focusable descendants and wrapping Tab at the boundaries.
3. **Focus-restore**: On close, return focus to the element that triggered the open (e.g. the hamburger button). Store the `triggerRef` before opening and call `.focus()` in the close handler.

**Why:** Without these three, keyboard users and screen-reader users cannot operate the dialog safely — they can Tab out of it, they land nowhere useful on open, and lose their navigation position on close.

**How to apply:** Flag all three as separate Critical findings whenever a hand-rolled dialog is found (even if `role="dialog"` and `aria-modal` are correctly set). Check: does the file use Base UI Dialog/Sheet/Popover? If yes, primitives handle it — don't re-flag. If no, all three are Critical.

Also: a persistent `<aside role="dialog">` that stays in the DOM when closed must have `inert` or `aria-hidden="true"` added when closed, or it exposes a phantom dialog landmark to AT.
