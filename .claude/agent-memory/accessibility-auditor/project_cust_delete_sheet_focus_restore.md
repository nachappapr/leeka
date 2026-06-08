---
name: cust-delete-sheet-focus-restore
description: RESOLVED 2026-06-08 — CustomerDeleteSheet finalFocus now wired via deleteButtonRef in CustomerFormModal; focus correctly returns to Delete button on Cancel/Esc close
metadata:
  type: project
---

RESOLVED. CustomerDeleteSheet is now a controlled component (open/onOpenChange props). CustomerFormModal creates `deleteButtonRef`, forwards it via `React.forwardRef` through `CustomerFormDeleteButton` → `PillButton` → Base UI ButtonPrimitive, and passes it as `finalFocus={finalFocusRef}` on `SheetContent`. Focus correctly returns to the Delete button when the sheet closes without confirming.

The pattern that caused this and how it was fixed:
- Sheet opened programmatically via `setConfirmOpen(true)` (not via SheetTrigger) — Base UI store has no trigger ref.
- Fix: `deleteButtonRef = useRef<HTMLButtonElement>(null)` in the parent modal; forward the ref to the button; pass it as `finalFocus` to SheetContent.
- Verified: the ref is threaded all the way through `CustomerFormDeleteButton` (which uses `React.forwardRef`) and `PillButton` (also `forwardRef`) to the native button element.

**Why:** Recurring pattern — any sheet/dialog opened programmatically rather than via a trigger primitive loses focus restore. See also [[base-ui-sheet-focus-restore]] and [[modal-focus-restore-programmatic]].

**How to apply:** The resolution pattern is canonical: ref on opening button + finalFocus prop on SheetContent. The component must use React.forwardRef all the way to the native element.
