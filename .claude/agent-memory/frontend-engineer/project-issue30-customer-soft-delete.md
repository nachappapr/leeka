---
name: project-issue30-customer-soft-delete
description: Issue #30 frontend half — soft-delete filters + real delete wiring in CustomerEditTrigger
type: project
---

Issue #30 (PRD #23 slice, follows #28/#29) FE half: added `.is("deleted_at", null)` to
`getCustomerDetail` and `businessHasCustomers` in `src/lib/data/customer.ts`, and wired
`CustomerEditTrigger.handleDelete` (customer-edit-trigger.tsx) to the already-shipped
`deleteCustomerAction` (returns `{ ok: true } | { ok: false; error }`).

**Fire-and-forget async chain confirmed safe:** the delete confirm path is
`CustomerDeleteSheet.handleDelete` (sync, calls `onDelete(customer)` then closes) →
`CustomerFormModal`'s inline `onDelete={(c) => { handleDelete(c); setConfirmOpen(false); }}` →
`CustomerFormModal.handleDelete` (sync, calls `onDelete?.(customer)` then `onOpenChange(false)`) →
`CustomerEditTrigger.handleDelete` (the only async link, now awaits `deleteCustomerAction`).
None of the intermediate layers await the call — that's fine and intentional: the promise is
created and owned by `CustomerEditTrigger`, so it runs to completion regardless of whether callers
await it. Sheet + modal close synchronously; toast + `router.push` land a beat later once the
action resolves. Did NOT touch the sheet/modal to add awaiting — would have required threading a
Promise through 3 layers of currently-`void`-typed callback props for no behavioral gain.

**TS void-return contextual typing:** assigning `async function handleDelete(c): Promise<void>` to
a prop typed `(customer: Customer) => void` typechecks cleanly — same pattern already used by
`handleSave` in the same file (assigned where a `Promise<{ok...}>`-returning prop type is expected
explicitly, but the void case is looser: TS allows a function returning a value where `void` is
expected). No cast needed.

**CustomerEditTrigger's `onDelete` prop has zero external consumers** — only JSX usage
(`customer-detail-header.tsx`) doesn't pass it. Kept the prop and still call `onDelete?.(c)` on
success (harmless, preserves the public API) rather than removing it — removing would be scope
creep on a read/wiring-only issue.

**database.ts already had `deleted_at`** on the `customers` Row/Insert/Update (backend engineer's
issue #30 migration landed it) — no type regen needed, `.is("deleted_at", null)` typechecked
immediately.
