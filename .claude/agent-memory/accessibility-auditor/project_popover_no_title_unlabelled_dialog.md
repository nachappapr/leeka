---
name: project-popover-no-title-unlabelled-dialog
description: Base UI Popover renders role=dialog with aria-labelledby wired to store; if no PopoverTitle is rendered, the dialog has no accessible name; recurring pattern in BrandDatePicker
metadata:
  type: project
---

Base UI `PopoverPopup` always renders `role="dialog"` and sets `aria-labelledby={titleId}` where `titleId` is populated by `PopoverTitle` via the store. If the consumer renders no `<PopoverTitle>`, `aria-labelledby` points to an empty/null ID and the dialog is unlabelled — a WCAG 4.1.2 failure.

**Why:** The `BrandDatePicker` wraps the Calendar in a `PopoverContent` with no `<PopoverTitle>`. Screen readers announce "dialog" with no name. The same issue was previously found in the Notification panel (see [[project-notification-panel-dialog-label]]).

**How to apply:** Always add `<PopoverTitle className="sr-only">` inside `PopoverContent` when it contains a functional date-picker or any non-trivial content. For BrandDatePicker, add a visually-hidden title computed from the `ariaLabel` prop (e.g. "Select date"). No client boundary — already in a Client Component.

Related: [[project-notification-panel-dialog-label]]
