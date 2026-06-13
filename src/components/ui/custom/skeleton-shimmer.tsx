// ── SkeletonBlock / SkeletonCircle / SkeletonPill ────────────────────────────
// Compound-family exception (same pattern as data-table.tsx): three tightly
// related shimmer primitives share one file for a symmetric import surface.
// Width and height come from the caller's className; radius defaults to
// rounded-md (overridable — Circle/Pill pass rounded-full, blocks pass their own).
// aria-hidden is NOT set here — the page-level wrapper owns the a11y boundary.

import { cn } from "@/lib/utils";

export interface SkeletonBlockProps {
  className?: string;
  onBg?: boolean;
}

export function SkeletonBlock({ className, onBg }: SkeletonBlockProps) {
  return <span className={cn("sk rounded-md", onBg && "sk-onbg", className)} />;
}

export function SkeletonCircle({ className, onBg }: SkeletonBlockProps) {
  return <SkeletonBlock className={cn("rounded-full", className)} onBg={onBg} />;
}

export function SkeletonPill({ className, onBg }: SkeletonBlockProps) {
  return <SkeletonBlock className={cn("rounded-full", className)} onBg={onBg} />;
}
