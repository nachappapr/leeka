---
name: notification-panel-dialog-label
description: NotificationPanel Popover and Sheet both lack aria-labelledby because PopoverTitle/SheetTitle are not used — the h2 in NotificationHead is a bare element, not the Base UI title primitive
metadata:
  type: project
---

Both `PopoverPrimitive.Popup` and `Dialog.Popup` (Sheet) set `aria-labelledby` only when `PopoverTitle` / `SheetTitle` is rendered inside the content — these components register their element ID into the store. A bare `<h2>` in a custom head component does NOT wire into the store and is therefore invisible to the dialog's `aria-labelledby`.

**Why:** Base UI uses a context/store pattern: `DialogTitle` calls `store.useSyncedValueWithCleanup('titleElementId', id)`. Without that call, titleElementId stays `undefined` and the popup renders with no accessible name.

**How to apply:** When auditing any custom panel head / sheet header, always check whether the content uses `PopoverTitle` / `SheetTitle` (or `DialogTitle` for alert dialogs) rather than a plain heading element. If not, flag as Critical (WCAG 4.1.2 Name, Role, Value + APG Dialog pattern).

The fix is: wrap the `<h2>` text in `<PopoverPrimitive.Title>` / `<SheetPrimitive.Title>` (passing `className` to preserve styles), or add `aria-labelledby` pointing to the h2's explicit id on the Popup element directly if the primitive supports it.
