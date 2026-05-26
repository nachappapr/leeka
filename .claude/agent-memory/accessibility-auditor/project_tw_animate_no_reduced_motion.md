---
name: tw-animate-no-reduced-motion
description: tw-animate-css@1.4.0 has no prefers-reduced-motion guard in its keyframes; all animate-in/animate-out/fade/zoom/slide classes on Popover and Sheet play unconditionally
metadata:
  type: project
---

`tw-animate-css` (used for `animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-*` etc.) does NOT include a `@media (prefers-reduced-motion: reduce)` rule in its dist CSS. This means all enter/exit animations on Popover and Sheet play at full intensity even when the user has requested reduced motion.

Affected components:
- `src/components/ui/primitives/popover.tsx` — `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95` (100ms, zoom + fade)
- `src/components/ui/primitives/sheet.tsx` — `transition duration-200` with `translate-y/x` start/end styles (200ms slide)
- `src/components/ui/primitives/sheet.tsx` — backdrop `transition-opacity duration-150`

**Why:** WCAG 2.3.3 (AAA) and 2.3.1 (AA) require non-essential animation to be suppressible. The zoom on the Popover is motion that can trigger vestibular issues.

**How to apply:** Add Tailwind `motion-reduce:` variants that override the animation:
- Popover: add `motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none` to the Popup className.
- Sheet: add `motion-reduce:transition-none motion-reduce:data-starting-style:translate-y-0 motion-reduce:data-ending-style:translate-y-0` (and x equivalents) to the SheetContent className.
These are pure CSS class additions — no client boundary cost.
