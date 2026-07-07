---
name: project-issue30-a11y-followup
description: Issue #30 a11y follow-up pass — Base UI nested-dialog registration mechanism, and the async delete-confirm pattern used for CustomerDeleteSheet
type: project
---

Follow-up a11y pass on issue #30 (customer soft-delete) fixed 4 findings in
`src/components/customers/customer-delete-sheet.tsx`, `customer-edit-trigger.tsx`,
`src/components/ui/custom/customer-form-modal.tsx`, and `brand-toast.tsx`.

**Base UI nested-dialog registration is React-context-based, not DOM-based.**
Confirmed by reading `node_modules/@base-ui/react/dialog/root/useRenderDialogRoot.js`:
`DialogRoot` calls `useDialogRootContext(true)` to find the nearest ancestor
`DialogRootContext.Provider` and passes it as `parentContext` into `useDialogRoot`.
This lookup walks the **React component tree**, not the rendered DOM tree — so a
`Dialog.Root` (or a wrapper like `Sheet`/`SheetPrimitive.Root`) registers as nested
IFF it is a JSX **descendant** of the parent `Dialog.Root`, even though both popups
portal out to `document.body` via `DialogPortal`/`SheetPortal`. Rendering the child
dialog as a JSX **sibling** (e.g. both inside the same outer `<>...</>` fragment)
means no `parentContext` is found, so `isTopmost` is always true for both dialogs →
Escape on the child closes both, and `finalFocus` restorations race. Fix: nest the
child `<Sheet>`/`<Dialog>` JSX-inside the parent's `<ModalContent>`/`<DialogPopup>`
children (anywhere in that subtree — doesn't need to be the direct child). This
generalizes to any future Modal-triggers-Sheet (or Sheet-triggers-Sheet) confirm
flow in this codebase — same fix shape whenever Base UI/Radix nested-dialog dismiss
ordering misbehaves.

**Async delete-confirm pattern (no optimistic close on failure):** threaded a
`Promise<boolean>` return through the callback chain instead of the old fire-and-forget
void chain: `CustomerEditTrigger.handleDelete` (calls the Server Action, toasts,
navigates on success, returns `true`/`false`) → `CustomerFormModal.handleDelete`
(closes the Modal only if `true`) → `CustomerDeleteSheet.handleDelete` (owns local
`isDeleting` state; closes the Sheet only if `true`, else resets `isDeleting` and
stays open for retry). While `isDeleting`, `CustomerDeleteSheet` also passes
`onOpenChange={undefined}` to the underlying `<Sheet>` (Base UI's `onOpenChange` is
typed `| undefined` explicitly) to block Escape/backdrop dismissal mid-flight — a
direct call to the real `onOpenChange` prop (not routed through Base UI's dismiss
handlers) still closes it programmatically on success. Reusable shape for any other
confirm-delete sheet that needs busy-state + no-optimistic-close-on-failure.

**Reviewer HIGH fix (rejection-safety):** the initial async rework only reset
`isDeleting` in the `ok===true`/`ok===false` branches — a rejected promise (network
blip, `supabase.auth.getUser()` throwing, etc.) would propagate unhandled and leave
`CustomerDeleteSheet` permanently wedged (buttons disabled, Escape/backdrop blocked
via `onOpenChange={isDeleting ? undefined : onOpenChange}`, no way out short of
reload). Fixed by wrapping all three layers: `CustomerEditTrigger.handleDelete`
wraps the `deleteCustomerAction` call in try/catch and fires the one error toast on
both `{ok:false}` and thrown-exception paths (`"Couldn't delete customer. Please try
again."` on catch); `CustomerFormModal.handleDelete` and
`CustomerDeleteSheet.handleDelete` each wrap their await in try/catch too but stay
toast-silent on catch (toast ownership stays at the edit-trigger layer to avoid
double-firing) — `CustomerDeleteSheet`'s catch sets `ok=false` and its `finally`
unconditionally calls `setIsDeleting(false)`, which is the actual guarantee: no
outcome (success, `{ok:false}`, or a rejection at any layer) can leave `isDeleting`
stuck `true`. General lesson: any confirm-flow that disables its own dismiss controls
based on a pending-boolean MUST reset that boolean in a `finally`, not just in the
resolved-value branches — an unhandled rejection is a normal failure mode for a
Server Action round-trip (network drop, auth/session hiccup), not an edge case.

**Reviewer Medium fix (try-scope too wide):** the first rejection-safety pass wrapped
`await deleteCustomerAction` AND the post-success side effects (`brandToast.success`,
`onDelete?.(c)`, `router.push`) in the same try — if a post-success side effect ever
threw, the catch would fire a contradictory error toast for a delete that actually
succeeded. Fixed by narrowing the try to cover only the action call (`let result; try
{ result = await deleteCustomerAction(c.id) } catch { ...error toast...; return false
}`), then handling `result.ok` entirely outside the try. General lesson: a try block
around an awaited call should end exactly where "did the call itself fail" ends —
don't let it swallow exceptions from code that only runs after success.

**Reviewer HIGH fix (native disabled drops focus to body):** the busy-state pass used
native `disabled={isDeleting}` on both sheet buttons. The confirm button holds focus
when clicked; per the HTML focus-fixup algorithm, a focused element that becomes
natively `disabled` in the same render is un-focused by the browser and focus falls
to `<body>` — during the entire busy window there were zero focusable elements
inside the sheet, and on failure focus was never restored (keyboard/SR user loses
their place to retry). Fixed by swapping to `aria-disabled={isDeleting}` on both
buttons (keeps them in the tab order and focusable, so focus survives the busy
window and failure->retry keeps the user's position), adding an early `if
(isDeleting) return;` guard at the top of each click handler (Cancel's new
`handleCancel` and `handleDelete` itself) to block the action while
aria-disabled-but-still-clickable, and swapping the Tailwind `disabled:` variants to
`aria-disabled:` variants (`aria-disabled:pointer-events-none
aria-disabled:opacity-50/70` — Tailwind v4 built-in ARIA variant, same pattern as
AP-45 Pro-gating). General lesson: **never use native `disabled` on a button that
holds focus at the moment it becomes disabled** — use `aria-disabled` + a guard
clause in the handler instead; this is now the standing pattern for any busy-state
button in this codebase (mirrors AP-45).

**Toast urgency:** `brandToast`'s error kind is now `role="alert"` on
`BrandToastBody`'s wrapper div (Sonner's own live region defaults to polite, and
`toast.custom()` bypasses Sonner's type-based role selection entirely) — success/warn
stay roleless/polite. The stable-id confirm→result toast pattern (see
`fireDeleteInvoiceToast` in `invoice-form-delete-button.tsx`, consumed by
`invoice-row-actions-menu.tsx`: `brandToast.warn({id: toastId, ...})` then
`brandToast.error({id: toastId, ...})` / `brandToast.success({id: toastId, ...})`
reusing the same id) still works after this change — role is just a normal prop on
the re-rendered body, doesn't affect Sonner's id-based toast replacement.
