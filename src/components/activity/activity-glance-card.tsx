import { Card } from "@/components/ui/custom/card"
import { NotificationIcon } from "@/components/ui/custom/notification-icon"
import type { NotificationTone } from "@/lib/types/notifications"

interface GlanceRow {
  label: string
  count: number
  tone: NotificationTone
}

interface ActivityGlanceCardProps {
  rows: ReadonlyArray<GlanceRow>
}

export function ActivityGlanceCard({ rows }: ActivityGlanceCardProps) {
  return (
    <Card title="This month at a glance" headingLevel={3}>
      <ul className="flex flex-col gap-1 px-4 py-3">
        {rows.map((row) => (
          <li
            key={row.tone}
            className="flex items-center gap-3 rounded-xl px-2 py-2"
          >
            <NotificationIcon tone={row.tone} className="size-8 shrink-0 rounded-lg" />
            <span className="flex-1 text-caption text-ink-2">{row.label}</span>
            <span className="text-body-sm font-black tabular-nums text-ink">
              {row.count}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
