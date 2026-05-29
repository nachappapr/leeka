---
name: channel-chips-pattern
description: Channel selector (WhatsApp/SMS/Email) uses plain <button>s with no aria-pressed and no group label — fails APG toggle button pattern; prescribe aria-pressed + role=group + aria-labelledby.
metadata:
  type: project
---

`ChannelChips` in `invoice-send-modal.tsx` renders three `<button>` elements with purely visual selected state (CSS class swap). AT has no way to know which channel is active.

The correct pattern for a mutually-exclusive selector of 2+ toggleable buttons where one is always active is either:
- **APG Radio Group**: `role="radiogroup"` wrapper + `role="radio"` + `aria-checked` + roving tabIndex + ArrowLeft/Right nav (since these are horizontal).
- **Toggle button group**: `role="group"` + `aria-labelledby` pointing at the "Channel" label + `aria-pressed="true/false"` on each button (then enforce single-select via JS).

For a 2-active-option set with one disabled, the radiogroup pattern is semantically cleaner. The disabled Email button needs `aria-disabled="true"` (not just HTML `disabled`) plus a visually-hidden reason text, because `title` is unreliable on disabled elements.

**Why:** SC 4.1.2 requires state to be programmatically determinable. A plain `<button>` selected state via CSS is invisible to AT.

**How to apply:** In any future single-select chip group (format selector, channel picker, sort-order chips), use radiogroup+radio pattern. If the selection can be "none" (multi-select), use group+aria-pressed per button instead.
