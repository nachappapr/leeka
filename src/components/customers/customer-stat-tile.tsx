import { cn } from "@/lib/utils"

interface CustomerStatTileProps {
  label: string
  value: string
  meta: string
  tone?: "ink" | "paid" | "overdue" | "ink-3"
}

export function CustomerStatTile({
  label,
  value,
  meta,
  tone = "ink",
}: CustomerStatTileProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-kicker font-extrabold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div
        className={cn(
          "tabular mt-1.5 text-money-sm font-extrabold",
          tone === "ink" && "text-ink",
          tone === "paid" && "text-paid-ink",
          tone === "overdue" && "text-overdue-ink",
          tone === "ink-3" && "text-ink-3",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-label text-ink-3">{meta}</div>
    </div>
  )
}
