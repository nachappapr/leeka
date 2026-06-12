---
name: project-statecode-silent-erase
description: stateCode missing from business-form prefill/submit causes silent DB null-overwrite on every save — High data-integrity scope issue
metadata:
  type: project
---

In AP-36 (business profile settings), the `stateCode` field was intentionally omitted from the form UI (no state dropdown in this unit). However, `updateBusinessProfile` unconditionally sets `state_code: stateCode || null` in its `.update()` call. Since the form never registers or submits `stateCode`, every save silently overwrites the stored `state_code` with `null`.

This is a High finding: scope decision (no dropdown this unit) creates a destructive mutation path. The fix direction is to either: (a) not include `state_code` in the `.update()` payload when `stateCode` is undefined, or (b) read the existing `state_code` from the business row and pass it through. Option (a) is simpler and safer.

**Why:** Partial updates that omit optional fields should use conditional payload construction, not always-null coercion, when those fields exist in the DB and have semantic value (GSTIN state-code matching depends on state_code).

**How to apply:** Any Server Action that updates a table but excludes a column from the form must either omit that column from the `.update()` call or preserve the existing value. Silent null-overwrite on partial-form save is always at least High.
