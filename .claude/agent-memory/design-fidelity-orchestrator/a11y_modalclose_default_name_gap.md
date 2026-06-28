---
name: a11y-modalclose-default-name-gap
description: Shared ModalClose (ui/custom/modal.tsx) has no default accessible name — app-wide a11y gap, deferred to an a11y pass
metadata:
  type: project
---

The `ModalClose` slot in `src/components/ui/custom/modal.tsx` renders an icon-only button (`{children ?? <XIcon aria-hidden />}`) with NO default accessible name. Every modal that doesn't pass `aria-label` on `<ModalClose>` exposes a nameless close button to AT (fails WCAG 4.1.2). The sibling primitives `dialog.tsx` and `sheet.tsx` already include an `<span className="sr-only">Close</span>` — `modal.tsx` is the outlier.

**Why:** Surfaced by the accessibility-auditor during the mark-paid modal build (2026-06-28, GitHub issue #7). Fixing the shared primitive touches every modal in the app, so it was kept out of a single feature node's scope per the "flag shared-component changes, don't silently edit" rule. Mirrors the project's existing pattern of deferring app-wide a11y items to a dedicated pass (see the coral-contrast and shared-form-primitive-contrast backlogs).

**How to apply:** Per-modal stopgap is `<ModalClose aria-label="Close" />` on the instance (what mark-paid-modal.tsx does). The real fix is one additive line in `modal.tsx` (`<span className="sr-only">Close</span>` in the default children) — only do it inside a user-approved app-wide a11y pass, not as a side effect of a feature node. Relates to [[a11y-busy-state-aria-disabled-pattern]].
