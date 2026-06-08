---
name: destructive-toast-confirm
description: Destructive confirmation via Sonner toast instead of alertdialog — SR users hear the announcement but get no focus move and no obvious path to the action buttons; HIGH finding
metadata:
  type: project
---

Using a Sonner toast (even `duration:Infinity`) for a destructive confirmation is HIGH, not Critical, at WCAG AA:
- The toast IS inside `aria-live=polite` so the title/sub are announced.
- Individual toast `<li>` has `tabIndex=0` so keyboard/VO users CAN reach it by swipe or the `Alt+T` hotkey.
- BUT focus is never moved to the toast on open — the user hears the message and must independently navigate to the toast to act.
- On desktop keyboards `Alt+T` focuses the toast region (Sonner default hotkey). On iOS VO the user must swipe to the toast. Neither mechanism is announced as part of the toast content — the user must already know.
- APG Dialog pattern requires: focus moves in on open, Esc closes, focus restores on close. None of these apply to a toast.

**Why:** The path to the action buttons is valid but undiscoverable. For a destructive operation this is a real barrier, especially on iOS VoiceOver (Bahi's primary target device).

**How to apply:** Flag any `brandToast.warn` or equivalent used as a destructive confirmation with HIGH severity (WCAG 4.1.3 / APG alertdialog). The correct fix is an `alertdialog` modal. If the toast approach is kept, the minimum mitigation is: (1) add a sr-only hint inside the toast body ("Tab to choose an action, or press Alt+T on desktop"), and (2) ensure `duration: Infinity` is set (it already is). Do NOT classify as Critical unless focus routing is provably broken (e.g. focus-trap that prevents access, or the toast is inside a `display:none` subtree). Related: [[view-swap-focus-management]].
