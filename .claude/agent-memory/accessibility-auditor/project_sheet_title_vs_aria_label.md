---
name: sheet-title-vs-aria-label
description: Base UI Sheet/Dialog labelling — aria-label on SheetContent works but violates 2.5.3 if it doesn't match visible title text; SheetTitle is the canonical fix
type: project
---

Using `aria-label` directly on `SheetContent` (which passes it through to the Base UI `Dialog.Popup` `<div role="dialog">`) does provide an accessible name and is technically valid. However:

1. The `aria-label` string must match the visible title text (SC 2.5.3 Label in Name). Mismatches like `aria-label="Sort invoices"` vs visible `<p>Sort by</p>` = violation.
2. The correct approach is `<SheetTitle>` (wraps `Dialog.Title`) which calls `store.useSyncedValueWithCleanup('titleElementId', id)`, populating the Base UI store. The Popup then receives `aria-labelledby={titleElementId}` automatically, wiring the visible heading as the dialog's accessible name.
3. `Dialog.Title` renders a `<h2>` by default — this also gives proper heading semantics inside the dialog (SC 1.3.1).

**Why:** `aria-label` is a shortcut that breaks the visible-label linkage; `SheetTitle` is the correct semantic contract per Base UI's own design.

**How to apply:** Whenever a Sheet is built with a visible title `<p>` or `<h2>` and `aria-label` on `SheetContent`, flag it: replace the `<p>` with `<SheetTitle>`, remove `aria-label` from `SheetContent`. Style `SheetTitle` via `className`. No client boundary impact — pure static HTML.
