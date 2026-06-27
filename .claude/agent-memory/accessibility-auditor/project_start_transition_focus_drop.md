---
name: start-transition-focus-drop
description: startTransition sets isPending=true synchronously, which can disable native <button>s and drop focus to body before the in-transition focus() call fires — fix is to call focus() before startTransition
metadata:
  type: project
---

When an async action is wrapped in `startTransition`, React sets `isPending = true` synchronously on the current frame. If `isPending` flows into an `isLoading` prop that drives native `disabled` on a button that currently has focus, the button is removed from the accessibility tree and the browser drops focus to `<body>` before the transition callback runs.

Pattern that fails:
```js
startTransition(async () => {
  const result = await fetch(…);
  // … state updates …
  focusTargetRef.current?.focus(); // TOO LATE — focus already lost to body
});
```

Pattern that passes:
```js
focusTargetRef.current?.focus(); // synchronous, before isPending flips
startTransition(async () => {
  const result = await fetch(…);
  // no focus() call needed here
});
```

**Why:** `startTransition` does NOT defer `isPending` — it is true before any await. Native `disabled` is not just visual; it removes the element from the tab order and the AT tree, so the browser immediately moves focus to the next focusable ancestor (often `<body>`). The `focus()` call inside the transition fires after the await — by then focus is already lost and the reassignment arrives as an unexpected jump to users who have tabbed away.

**How to apply:** Any time you see `startTransition(async () => { … ref.current?.focus() })` inside a pagination/navigation handler that also disables interactive controls via `isPending`, move the `focus()` call to execute synchronously immediately before `startTransition`. First seen: `invoices-list-client.tsx:110–119`, onPaginationChange, async fetch branch (2026-06-27).
