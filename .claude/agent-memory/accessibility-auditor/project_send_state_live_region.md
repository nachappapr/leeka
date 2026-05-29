---
name: send-state-live-region
description: State-machine button label swaps (idle→Sending…→Sent) are visually-only without an aria-live region; SC 4.1.3 requires status messages to be announced.
metadata:
  type: project
---

`SendButtonContent` swaps text and icon based on `sendState` (idle/sending/sent). Without an `aria-live` region, the "Sending…" and "Sent" transitions are silent to screen-reader users. The `Loader2 animate-spin` spinner also runs indefinitely with no `motion-reduce:` guard.

**Fix pattern:** Add a visually-hidden `role="status" aria-live="polite"` region outside the button that mirrors the current state: "Sending invoice…" / "Invoice sent". The button itself can keep its label. This is the canonical SC 4.1.3 fix — the live region announces, the button label is independent.

**Loader2 animate-spin:** Tailwind's `animate-spin` has no built-in prefers-reduced-motion guard. Add `motion-reduce:animate-none` alongside every `animate-spin` usage. This is a pure CSS fix (no client boundary cost) per WCAG 2.3.3 / SC 2.2.2 (vestibular concern for continuous rotation).

**Why:** SC 4.1.3 — status messages that do not receive focus must be announced via a live region. SC 2.2.2 / 2.3.3 — continuous animation (spinner) with no reduced-motion path is a vestibular hazard.

**How to apply:** Any state-machine that swaps button text (loading/success/error) needs a companion live region. The button label change alone is NOT reliably announced.
