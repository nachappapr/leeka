---
name: base-ui-sheet-focus-restore
description: Base UI Sheet focus restoration fails when opened programmatically (no SheetTrigger); use finalFocus prop on SheetContent to point to the trigger ref
type: project
---

Base UI `Dialog` (used as the Sheet primitive) restores focus to the trigger element on close via `FloatingFocusManager returnFocus: "popup"`. This only works when the dialog was opened via a `<Dialog.Trigger>` (registered in the Base UI store). When opened programmatically (`setOpen(true)` from a click handler on a plain `<button>` not wrapped in `<SheetTrigger>`), the store has no trigger element, and `returnFocus` falls back to `document.body`.

**Why:** Sequential sheet chains (menu → sort/filter nested sheet, each opened programmatically) lose focus to body after every close. Screen-reader and keyboard users lose their page position.

**Fix:** Pass `finalFocus={triggerRef}` to `SheetContent` (it forwards to `Dialog.Popup` which passes it to `FloatingFocusManager`). Create a `useRef` on the trigger button and thread it down through the component tree to each sheet's `SheetContent`. Confirmed: `DialogPopup.js` line 44 accepts `finalFocus` as a prop.

**How to apply:** Any time a Sheet opens without a `<SheetTrigger>` (i.e. programmatic open), check that `finalFocus` is wired to the element that logically triggered the interaction. If nested sheets exist, each must carry the same `finalFocus` ref pointing to the original page-level trigger.
