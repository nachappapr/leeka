---
name: project_view_swap_focus_management
description: Focus management contract for client-side view-swap (not route change) — required: move focus to new view's heading (or prominent interactive landmark) on swap-in; restore focus to trigger on swap-back.
metadata:
  type: project
---

Client-side `view` state machine (edit → preview → edit) is a SPA-style "virtual navigation". SC 2.4.3 + APG Dialog/Navigation apply: focus must not strand on the now-unmounted trigger element (which falls to `document.body`).

**Contract for swap-to-preview:**
- After `setView("preview")`, move focus to the review screen's `<h1>` (or the back button) via a `useEffect` + `ref.current?.focus()`.
- The `<h1>` must be `tabIndex={-1}` to be programmably focusable without adding it to the tab order.

**Contract for swap-back-to-edit:**
- After `setView("edit")`, restore focus to the "Preview invoice" PillButton (the trigger). This requires a `previewBtnRef` passed down from the form to the edit bar.
- Alternatively, focus the edit-view heading or the first focusable field — but the trigger is the APG-preferred target.

**Why:** Without explicit focus management on a view swap, focus falls to `document.body`. Screen-reader users get no announcement that the view changed; keyboard users lose their position entirely.

**How to apply:** Any time a full-screen view swap is driven by `setState` (not `next/navigation`), apply this two-ref pattern. The forms are already `"use client"` — no boundary cost.

**Implementation note:** The `<h1>` in `InvoiceFormReviewHeader` needs `tabIndex={-1}` + a `ref` prop (or forward-ref). The parent form adds a `useEffect` that fires when `view === "preview"` and calls `reviewHeadingRef.current?.focus()`.
