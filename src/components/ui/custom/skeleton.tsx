import { cn } from "@/lib/utils";
import { Skeleton as SkeletonPrimitive } from "@/components/ui/primitives/skeleton";

// ── Brand Skeleton wrapper ────────────────────────────────────────────────────
// Adds a prefers-reduced-motion guard the shadcn primitive lacks (WCAG 2.3.3):
// the pulse animation is suppressed for users who request reduced motion.
// Use this wrapper everywhere in app code; the pristine primitive stays untouched.

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <SkeletonPrimitive className={cn("motion-reduce:animate-none", className)} {...props} />;
}
