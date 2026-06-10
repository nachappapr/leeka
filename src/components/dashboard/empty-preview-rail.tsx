import { IndianRupee, Check, Clock } from "@/components/icons";
import { cn } from "@/lib/utils";
import { PREVIEW_TILES } from "@/lib/constants/empty-dashboard";
import type { PreviewTile } from "@/lib/types/empty-dashboard";

const ICON_MAP = {
  IndianRupee,
  Check,
  Clock,
} as const;

export function EmptyPreviewRail() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <p className="text-kicker font-extrabold uppercase tracking-wider text-coral">
        Once invoices flow in
      </p>
      <h2 className="mt-1.5 mb-4 text-title-sm font-extrabold tracking-snug text-ink">
        This is what you&rsquo;ll see here
      </h2>

      <div className="flex flex-col gap-2.5">
        {PREVIEW_TILES.map((tile) => (
          <PreviewTileRow key={tile.label} tile={tile} />
        ))}
      </div>
    </div>
  );
}

function PreviewTileRow({ tile }: { tile: PreviewTile }) {
  const IconComponent = ICON_MAP[tile.icon];

  return (
    <div className="flex items-center gap-3 rounded-sm border border-dashed border-line-strong bg-cream px-3.5 py-3">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-sm",
          tile.bgClass,
          tile.inkClass,
        )}
      >
        <IconComponent className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption font-bold text-ink">{tile.label}</p>
        <p className="mt-0.5 text-label font-medium leading-snug text-ink-3">{tile.hint}</p>
      </div>
      <span className="ml-2 font-mono tabular-nums text-money-sm font-extrabold text-line-strong">
        —
      </span>
    </div>
  );
}
