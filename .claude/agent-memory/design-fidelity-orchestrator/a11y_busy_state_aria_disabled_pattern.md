---
name: a11y-busy-state-aria-disabled-pattern
description: For pending/busy buttons prefer aria-disabled + focusableWhenDisabled + handler guard (keeps focus); native disabled drops focus. SendChannelsModal is the outlier.
metadata:
  type: feedback
---

For buttons that go busy during a `useTransition` (modals, action bars), the app's dominant and preferred pattern is `focusableWhenDisabled` (Base UI button) / `aria-disabled={isPending}` + an `if (isPending) return;` handler guard + `aria-disabled:opacity-50 aria-disabled:cursor-not-allowed` for the visual — NOT native `disabled`. Reference call sites: `src/components/invoices/export-trigger.tsx`, `channel-chips.tsx`, `action-sheet-row.tsx`, `invoices-table.tsx`, `invoice-form-save-draft-button.tsx`, `invoice-form-edit-mobile-bar.tsx`. Add `aria-busy={isPending}` on the primary action too.

**Why:** Native `disabled` removes the focused button from the a11y tree mid-transition; the dialog focus-trap then re-asserts focus to some other control (e.g. the X), stranding AT users. Established during the mark-paid modal build (2026-06-28). NOTE: `SendChannelsModal` (ui/custom/send-channels-modal.tsx) still uses plain `disabled` — it is the outlier, not the reference; bringing it in line is a future a11y-pass item, not a per-feature fix.

**How to apply:** When a build brief says "mirror SendChannelsModal's busy handling", mirror the busy UX (Loader2 + label change + close-on-success) but use the aria-disabled pattern above for the disabled mechanics, and flag the divergence. Also wire `finalFocus` (restore focus to the opener) and `initialFocus` (safe default, e.g. Cancel) on any Modal opened programmatically via setState — Base UI loses the trigger ref on programmatic opens. Relates to [[a11y-modalclose-default-name-gap]].
