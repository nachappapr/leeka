import { cn } from "@/lib/utils";
import { LekkaLogo } from "@/components/icons";

interface BrandBadgeProps {
  size?: number;
  svgSize?: string;
  color?: string;
  /**
   * Accessible name. Omit when the badge is paired with visible brand text
   * (default — the tile is then decorative and hidden from assistive tech).
   * Provide when the badge stands alone as the sole brand mark.
   */
  label?: string;
  className?: string;
}

export function BrandBadge({
  size = 40,
  svgSize = "62%",
  color = "var(--color-coral)",
  label,
  className,
}: BrandBadgeProps) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("flex shrink-0 items-center justify-center rounded-md shadow-coral", className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: color,
      }}
    >
      <LekkaLogo style={{ width: svgSize, height: svgSize }} />
    </div>
  );
}
