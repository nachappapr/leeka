---
name: disabled-vs-aria-disabled-discoverability
description: HTML disabled removes control from tab order; aria-disabled keeps it discoverable. Base UI Button supports focusableWhenDisabled prop for the correct "disabled but discoverable" pattern.
metadata:
  type: project
---

When a control must communicate WHY it is unavailable (e.g. a Pro-gated button), the correct pattern is **not** `disabled` HTML attribute — that removes the element from the keyboard Tab order entirely, making the restriction message unreachable to keyboard-only and keyboard-SR users.

**Correct pattern:** `aria-disabled="true"` WITHOUT `disabled`, plus an onClick guard. In Base UI `ButtonPrimitive`, this is done via the `focusableWhenDisabled` prop (confirmed in `useFocusableWhenDisabled.js`): when `focusableWhenDisabled=true` and `isNativeButton=true`, the hook sets `aria-disabled` but does NOT set the `disabled` attribute, keeping the element focusable.

**Why:** WCAG 4.1.2 requires name, role, and value to be programmatically determinable. For a restriction reason to be perceivable to keyboard users, the element must be reachable by Tab. `disabled` removes it. `aria-disabled` does not.

**How to apply:**
- Any PillButton, ActionSheetRow, or other Base UI Button that must be "disabled but discoverable": pass `focusableWhenDisabled` prop, drop the `disabled` prop, add `aria-disabled="true"` (or let Base UI set it), and guard the onClick handler.
- `ActionSheetRow`: remove `disabled={disabled}` from the `<button>`, use `onClick={disabled ? undefined : onClick}` and `aria-disabled={disabled || undefined}`.
- Using both `disabled` AND `aria-disabled="true"` is the worst of both worlds — `disabled` cancels the purpose of `aria-disabled`.

**Verdict from AP-45 audit (2026-06-13):** Both ExportTrigger and ActionSheetRow had this pattern wrong (Critical). No client boundary cost for either fix — both are already Client Components.
