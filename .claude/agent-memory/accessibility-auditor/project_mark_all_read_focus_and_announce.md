---
name: mark-all-read-focus-and-announce
description: MarkAllReadButton unmounts after success (unreadCount drops to 0) — focus goes to body and success is never announced; both are new issues introduced when the button was wired to a real action
metadata:
  type: project
---

`MarkAllReadButton` is conditionally rendered: `{unreadCount > 0 && <MarkAllReadButton />}`. When the action succeeds and `router.refresh()` re-renders with `unreadCount === 0`, the button unmounts. Focus goes to `<body>`. No toast or live region announces success.

**Why:** Before this epic the button was a stub with no real action and always rendered. The unmount-on-success pattern is only a problem now that the real action is wired.

**How to apply (two separate fixes):**

1. **Focus restore**: The `MarkAllReadButton` component itself cannot manage focus restore on unmount (it's gone). The parent, `ActivityPageHeader`, must hold a `ref` to the next logical focus target (e.g., the "Notification settings" `<Link>`) and pass a `onSuccess` callback that calls `.focus()` on that ref. `ActivityPageHeader` already receives `unreadCount` as a prop and is already a Server Component — it needs to become `"use client"` to hold the ref and callback.
   - **CLIENT-BOUNDARY IMPACT**: `ActivityPageHeader` would need `"use client"` or a thin client wrapper around the button slot.

2. **Success announcement**: Add a `brandToast.success("All notifications marked as read")` call inside `handleClick` after `result.ok`, OR render a sr-only `role="status"` client element that announces on state change.
   - No client-boundary cost for toast (already in client component).

SC 2.4.3 (focus loss) + SC 4.1.3 (no success announcement).
