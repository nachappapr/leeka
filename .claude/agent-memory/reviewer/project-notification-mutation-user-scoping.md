---
name: project-notification-mutation-user-scoping
description: markAllNotificationsRead scopes by business_id RLS only, not by user_id — acceptable for current single-owner model but worth watching
metadata:
  type: project
---

`markAllNotificationsRead` in `src/app/(app)/activity/actions.ts` does `.update({ read: true }).eq("read", false)` with no `.eq("user_id", user.id)` filter. RLS "tenant: owner update" restricts by business_id only (all business members can update each other's notifications). 

**Why:** ArthaPatra is currently single-owner, so this is not exploitable. The action does verify auth via `getUser()` before the mutation. The issue only surfaces in a multi-member scenario.

**How to apply:** Flag as Medium if the mutation stays unscoped when multi-member features are introduced. For now, acceptable given single-owner invariant. The fix direction is adding `.eq("user_id", user.id)` to the update call so each member can only mark their own notifications read.
