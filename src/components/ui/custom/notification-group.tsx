import { NotificationItem } from "@/components/ui/custom/notification-item"
import type { NotificationItemData } from "@/lib/types/notifications"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NotificationGroupProps {
  label: string
  items: NotificationItemData[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function NotificationGroup({ label, items }: NotificationGroupProps) {
  return (
    <section aria-label={label}>
      <h3
        className={[
          "text-kicker text-ink-3",
          // Mobile / tablet
          "px-5 pt-4 pb-2",
          // Desktop
          "lg:px-6 lg:pt-5 lg:pb-2.5",
        ].join(" ")}
      >
        {label}
      </h3>
      <ul className="flex flex-col">
        {items.map((it) => (
          <li key={it.id}>
            <NotificationItem
              customer={it.customer}
              verb={it.verb}
              amount={it.amount}
              invoiceNo={it.invoiceNo}
              tone={it.tone}
              timestamp={it.timestamp}
              unread={it.unread}
              href={it.href}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export { NotificationGroup }
