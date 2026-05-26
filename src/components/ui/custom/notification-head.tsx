import { NotificationCount } from "@/components/ui/custom/notification-count"

interface NotificationHeadProps {
  unreadCount: number
  /** Mark-all-read button (rendered to the left of the close button). */
  markAllSlot?: React.ReactNode
  closeSlot: React.ReactNode
}

function NotificationHead({
  unreadCount,
  markAllSlot,
  closeSlot,
}: NotificationHeadProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border pl-5 pr-2.5 pt-3.5 pb-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <h3
          id="notification-panel-title"
          className="text-body font-extrabold text-ink leading-none"
        >
          Notifications
        </h3>
        {unreadCount > 0 && <NotificationCount count={unreadCount} />}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {markAllSlot}
        {closeSlot}
      </div>
    </header>
  )
}

export { NotificationHead }
