import { ACTIVITY_ICON_MAP, ACTIVITY_ICON_STYLE } from "@/lib/constants"
import type { ActivityItem } from "@/lib/types"
import { Card } from "@/components/ui/custom/card"

// ── Private sub-component ────────────────────────────────────────────────────

function ActivityRow({
  item,
  isLast,
}: {
  item: ActivityItem
  isLast: boolean
}) {
  const Icon = ACTIVITY_ICON_MAP[item.icon]
  return (
    <div
      className={
        "flex items-start gap-3 py-3.5" +
        (isLast ? "" : " border-b border-border")
      }
    >
      <div
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
          ACTIVITY_ICON_STYLE[item.icon]
        }
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-bold text-ink">{item.title}</div>
        <div className="mt-0.5 text-label text-ink-3">{item.meta}</div>
      </div>
    </div>
  )
}

// ── Public component ─────────────────────────────────────────────────────────

export function ActivityCard({ items }: { items: ReadonlyArray<ActivityItem> }) {
  return (
    <Card title="Activity">
      <div className="flex flex-col px-6">
        {items.map((item, i) => (
          <ActivityRow
            key={item.title}
            item={item}
            isLast={i === items.length - 1}
          />
        ))}
      </div>
    </Card>
  )
}
