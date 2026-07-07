---
name: a11y-soft-delete-frozen-wrapper-backlog
description: Issue #30 delete-confirm a11y — 4 findings FIXED under Option-B; 2 pre-existing app-wide items (ModalClose unnamed, edit-form busy-state focus-blur) surfaced for a user decision
type: project
---

Issue #30 (customer soft delete, 2026-07-07). The user chose **Option B**: explicitly lifted the shared-wrapper freeze for this unit and reopened the failure-UX, authorizing fixes to the four a11y findings the auditor originally raised. All four are now FIXED and re-audited PASS:
1. Nested-dialog Escape/focus — `CustomerDeleteSheet` moved to a JSX descendant inside `<ModalContent>` (customer-form-modal.tsx) so Base UI's nested-dialog stack scopes Escape to the topmost sheet.
2. Optimistic close / no busy state — reworked: "Deleting…" busy state (aria-disabled buttons + guards, aria-busy, sr-only role=status), try/catch/finally so isDeleting always resets; on FAILURE the sheet/modal stay open for retry (vendor still on detail page); on SUCCESS toast + navigate.
3. Error toasts announced assertively — `brand-toast.tsx` BrandToastBody sets `role={kind==="error" ? "alert" : undefined}` (app-wide; success/warn stay polite; stable-id confirm-toast pattern verified intact).
4. Sheet `aria-describedby="cust-delete-desc"` wired to the explanatory paragraph.

Also fixed in-loop: a HIGH focus-blur REGRESSION the busy-state introduced (native `disabled` blurred the focused confirm button to <body>) → replaced with `aria-disabled` + `if (isDeleting) return;` guards, keeping focus-visible rings. This is the project's "disabled-but-discoverable" pattern; prefer it over native `disabled` for busy/inactive controls inside dialogs.

**STILL DEFERRED — two pre-existing, app-wide items the deep re-audit surfaced, NOT #30 regressions, outside the four authorized fixes (carried to the user as a decision):**
- **(Critical) `ModalClose` icon button has no accessible name** — `src/components/ui/custom/modal.tsx` (~line 134). Icon is aria-hidden, no children, no aria-label -> SR announces only "button". Affects EVERY modal in the app. Fix: default `children ?? (<><XIcon aria-hidden /><span className="sr-only">Close</span></>)` in the primitive.
- **(High) Edit-form Save/Cancel busy-state focus-blur** — `src/components/ui/custom/customer-form-modal.tsx:289,307`. Same native-`disabled` blur-to-body mechanism as the delete-sheet regression, on the edit form's own submit (pre-existing, not the delete flow). Fix: same aria-disabled + guarded-handler pattern (Save is a Base UI PillButton -> also needs `focusableWhenDisabled`).

**Why:** #30's authorization covered only the four named findings + the delete flow. These two are broader (a shared primitive used by all modals; the edit-form submit path) and deserve their own reviewed change, not a silent smuggle into #30.
**How to apply:** When the user green-lights or a dedicated a11y unit is opened, fix the `ModalClose` name first (highest blast radius, one-line). Do NOT auto-fold into an unrelated feature unit whose fence bars wrapper edits. Related: [[feedback-shared-ui-immutable]].
