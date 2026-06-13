// ── SkeletonPageHeader ────────────────────────────────────────────────────────
// Shared kit piece: mirrors the real PageHeader layout for zero-layout-shift
// skeletons across all feature pages. aria-hidden is NOT set here — the
// page-level wrapper owns the a11y boundary (same convention as the other
// skeleton primitives). Renders a plain <div> rather than the real header's
// landmark so the decorative subtree introduces no source-misleading landmark.

import { SkeletonBlock, SkeletonPill } from "@/components/ui/custom/skeleton-shimmer";

export interface SkeletonPageHeaderProps {
  back?: boolean;
  actions?: number;
  titleW?: string;
  variant?: "actions" | "pill";
}

export function SkeletonPageHeader({
  back = false,
  actions = 2,
  titleW = "w-44",
  variant = "actions",
}: SkeletonPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {back && <SkeletonBlock className="size-10 rounded-full" onBg />}
        <div className="flex min-w-0 flex-col gap-2">
          <SkeletonBlock className={`h-7 ${titleW}`} onBg />
          <SkeletonBlock className="h-3.5 w-64" onBg />
        </div>
      </div>

      {variant === "pill" ? (
        <SkeletonPill className="h-6 w-18 self-start" onBg />
      ) : (
        actions > 0 && (
          <div className="flex shrink-0 items-center gap-2 max-mobile:hidden">
            {Array.from({ length: actions }).map((_, i) => (
              <SkeletonBlock
                key={i}
                className={`h-10 rounded-full ${i === actions - 1 ? "w-32" : "w-26"}`}
                onBg
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
