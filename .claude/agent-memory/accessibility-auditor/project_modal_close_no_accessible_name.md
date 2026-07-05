---
name: modal-close-no-accessible-name
description: ModalClose brand wrapper strips the sr-only "Close" text that the pristine DialogContent has — icon-only button with no accessible name (WCAG 4.1.2 Critical).
metadata:
  type: project
---

`ModalClose` in `src/components/ui/custom/modal.tsx` renders an icon-only `<button>` with `<XIcon aria-hidden />` as its only child — no `aria-label` and no sr-only text. Every call to `<ModalClose />` across all modals is missing an accessible name.

**Why:** The pristine `DialogContent` in `primitives/dialog.tsx` correctly adds `<span className="sr-only">Close</span>` beside the XIcon inside its close button. When the brand wrapper `modal.tsx` was written, this text was not carried over. The `ModalClose` fallback path (`children ?? <XIcon size={18} aria-hidden />`) only renders the icon, never text.

**Pattern at fault:** icon-only button in a brand-wrapper that forgets the sr-only name from the pristine component.

**Fix (preferred — fixes all consumers):**
`modal.tsx:134` — change
  `{children ?? <XIcon size={18} aria-hidden />}`
to
  `{children ?? <><XIcon size={18} aria-hidden /><span className="sr-only">Close</span></>}`

**Fix (per-call fallback):**
  `<ModalClose aria-label="Close" />` — the aria-label flows through `...props` → `DialogClose` → `DialogPrimitive.Close`.

**How to apply:** Flag immediately whenever `<ModalClose />` is used in any modal. Cite `modal.tsx:134` as the root cause. No client-boundary cost — modal.tsx is already `"use client"`.

**Components affected (2026-06-29):**
- receipt-channels-modal.tsx (Unit 3, AP-19)
- reminder-channels-modal.tsx (reference — same gap, pre-existing)
- Any future modal using the ModalClose slot
