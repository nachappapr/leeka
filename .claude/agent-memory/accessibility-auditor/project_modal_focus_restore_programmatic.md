---
name: modal-focus-restore-programmatic
description: CustomerFormModal (and all Modal-based dialogs) opened via setOpen(true) from a plain button lose focus to body on close; fix: initialFocus + finalFocus props on ModalContent/DialogPrimitive.Popup
metadata:
  type: project
---

`CustomerFormModal` is opened via `setOpen(true)` from a plain `PillButton.onClick` (no `<DialogTrigger>` wrapping). Base UI `Dialog` only restores focus to the trigger element if the trigger was registered in the store via `<Dialog.Trigger>`. Without that, `finalFocus` defaults to `document.body`.

Additionally, `customer-form-modal.tsx` uses a `useEffect` + `requestAnimationFrame` to focus `nameRef` (the name input). Base UI also has its own initial-focus logic (first focusable element). These two can race; the correct fix is to use `initialFocus={nameRef}` on `ModalContent`/`DialogPrimitive.Popup` instead of the `useEffect`.

**Fix pattern:**
1. In `customer-edit-trigger.tsx` / `customer-add-trigger.tsx`: create `const triggerRef = useRef<HTMLButtonElement>(null)`, attach to the `PillButton`, and pass down as `finalFocusRef`.
2. In `customer-form-modal.tsx`: accept `finalFocusRef?: React.RefObject<HTMLElement>` prop, pass `initialFocus={nameRef}` and `finalFocus={finalFocusRef}` to `ModalContent` (which wraps `DialogPrimitive.Popup`).
3. Or: use `<DialogTrigger>` render prop pattern if the trigger is always the PillButton.

**Why:** Without focus restoration, keyboard and screen-reader users lose their page position every time the modal closes. The same pattern was documented for Sheet in `base-ui-sheet-focus-restore.md`.

**How to apply:** Every Modal/Sheet opened programmatically (not via the Base UI Trigger) needs `finalFocus` wired to the trigger ref.
