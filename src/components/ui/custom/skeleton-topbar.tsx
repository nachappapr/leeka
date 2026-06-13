import { SkeletonBlock, SkeletonCircle } from "@/components/ui/custom/skeleton-shimmer";

type SkeletonTopbarProps = {
  titleW?: string;
  subtitleW?: string;
  subtitle?: boolean;
};

export function SkeletonTopbar({
  titleW = "w-32",
  subtitleW = "w-44",
  subtitle = true,
}: SkeletonTopbarProps) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border bg-background/85 px-7 py-3.5 backdrop-blur-md backdrop-saturate-150 max-mobile:flex max-mobile:gap-2.5 max-mobile:px-4 max-mobile:py-3">
      <div className="min-w-0 max-mobile:flex-1">
        <SkeletonBlock className={`h-6.5 ${titleW}`} onBg />
        {subtitle && <SkeletonBlock className={`mt-1 h-3 ${subtitleW}`} onBg />}
      </div>
      <div className="flex items-center justify-end gap-2 max-mobile:ml-auto">
        <SkeletonCircle className="size-10" onBg />
      </div>
    </div>
  );
}
