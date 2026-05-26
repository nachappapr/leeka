---
name: bare-button-focus-ring
description: Native <button> elements in topbar (Bell, MobileMenuButton) get only the global outline-ring/50 fallback (≈1.67:1 on bg-background) — no explicit focus-visible:ring-* class; fails WCAG 2.4.11
metadata:
  type: project
---

Native `<button>` elements hand-rolled in app code (as opposed to PillButton which has an explicit `focus-visible:ring-4 focus-visible:ring-coral-press`) rely on the `@layer base { * { outline-ring/50 } }` global. That global resolves to `#f46a39` at 50% opacity, which blended over `#fbf6ef` (bg-background) gives ≈ `#f8b094` at approximately 1.67:1 — far below the 3:1 WCAG 2.4.11 floor.

**Fix pattern for all bare buttons:** add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2` to the className. This is static CSS, no client boundary impact.

**Why:** the global `outline-ring/50` was designed as a low-specificity fallback; components that suppress it (PillButton uses `outline-none` in CVA) or rely on it without a high-contrast override are both at risk. The pattern keeps recurring for icon-only buttons (Bell, MobileMenuButton, future icon actions).

**How to apply:** whenever auditing a hand-rolled `<button>` with no `focus-visible:ring-*` in its className, verify it doesn't inherit a passing ring from a parent or the global before flagging as High.
