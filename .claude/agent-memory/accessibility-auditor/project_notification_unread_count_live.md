---
name: notification-unread-count-live
description: NotificationCount badge is aria-hidden; unread count is never announced to screen reader users; no aria-live region bridges the gap
metadata:
  type: project
---

`NotificationCount` renders the badge as `aria-hidden="true"`. The bell button's `aria-label` is static ("Notifications") and does not include the count. There is no `aria-live` region anywhere in the notification surface that would announce the count when it changes.

**Why:** Screen reader users never learn there are unread notifications unless they open the panel. For a notification badge this is a SC 4.1.3 (Status Messages) gap — the count is a status message that must be programmatically determinable without focus.

**How to apply:** Fix options in order of preference:
1. Make the bell button's `aria-label` dynamic: `aria-label={unreadCount > 0 ? \`Notifications, ${unreadCount} unread\` : "Notifications"}`. This requires the parent (TopBar) to receive unreadCount, or `NotificationPanel` to pass it back to the trigger.
2. Keep the static label but add a visually-hidden `<span role="status" aria-live="polite" aria-atomic="true">` near the trigger that reflects the count string — update it reactively.

Both fixes require client-side JS (CLIENT-BOUNDARY IMPACT). Topbar is currently a Server Component; the panel itself is already a Client Component, so option 1 is achievable by letting the `children` trigger receive its `aria-label` from `NotificationPanel` via `React.cloneElement` or a render prop pattern.
