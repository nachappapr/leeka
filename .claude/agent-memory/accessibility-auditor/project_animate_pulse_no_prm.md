---
name: animate-pulse-no-prm
description: Tailwind v4 animate-pulse on Skeleton primitive has no prefers-reduced-motion guard; affects every page skeleton in the app
type: project
---

`src/components/ui/primitives/skeleton.tsx` applies `animate-pulse` unconditionally. Verified in the compiled dev CSS (`.next/dev/static/chunks/[root-of-the-server]__*.css`) that the `@keyframes pulse` block has no `@media (prefers-reduced-motion: reduce)` wrapper. Tailwind v4 does not auto-guard `animate-pulse`.

**Why:** Users with vestibular disorders / epilepsy set `prefers-reduced-motion: reduce` to suppress non-essential animations. A full-page shimmer pulsing at 2s infinite on every loading screen is exactly the animation this preference is meant to stop. SC 2.3.3 (AAA) and defensively SC 2.3.1 (AA, for >3 flashes/sec — pulse is slow so this is AAA territory only). Severity: Medium.

**How to apply:** Add `motion-reduce:animate-none` to the `Skeleton` className. This is a pure-CSS fix inside the primitive; no client boundary cost. Fix applies to `src/components/ui/primitives/skeleton.tsx`:

```tsx
className={cn("animate-pulse motion-reduce:animate-none rounded-md bg-muted", className)}
```

This propagates to all seven `loading.tsx` files and any other Skeleton consumer automatically.

Related: [[animate-spin-no-prm]] (same pattern, Loader2 in send-channels-modal).
First flagged on EP0 AP-3 audit (2026-06-10).
