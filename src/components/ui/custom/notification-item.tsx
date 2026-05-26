import { cn, formatAmount, relTime } from "@/lib/utils"
import { NotificationRail } from "@/components/ui/custom/notification-rail"
import { NotificationIcon } from "@/components/ui/custom/notification-icon"
import { NotificationDot } from "@/components/ui/custom/notification-dot"
import type { NotificationTone } from "@/lib/types/notifications"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotificationItemProps {
  customer: string
  verb: string
  amount: number
  invoiceNo: string
  tone: NotificationTone
  timestamp: string | Date
  unread?: boolean
  /** Accepted for API compatibility; wired in Unit 12. */
  href?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function NotificationItem({
  customer,
  verb,
  amount,
  invoiceNo,
  tone,
  timestamp,
  unread = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  href: _href,
}: NotificationItemProps) {
  const formattedAmount = formatAmount(amount)
  const timeLabel = relTime(timestamp)
  const ariaLabel = `${customer} ${verb} ₹${formattedAmount} for ${invoiceNo}, ${timeLabel}`

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        // Layout
        "relative flex w-full items-stretch gap-3 text-left transition-colors",
        // Mobile padding (default)
        "pl-5 pr-4 pt-3 pb-3.5",
        // Desktop padding override
        "lg:pl-6 lg:pr-5 lg:pt-2.5 lg:pb-3",
        // Unread tint
        unread && "bg-coral-soft/40",
        // Hover + focus
        "hover:bg-surface-2",
        "focus-visible:outline-none focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-inset",
      )}
    >
      {/* Tone accent bar — h-full resolves because parent is items-stretch */}
      <NotificationRail tone={tone} />

      {/* Icon — self-start prevents stretch distortion */}
      <NotificationIcon tone={tone} className="self-start" />

      {/* Body copy */}
      <div className="min-w-0 flex-1 self-center">
        <p className="text-13 text-ink-2 leading-snug max-mobile:text-body-sm">
          <span className="font-bold text-ink">{customer}</span>{" "}
          {verb}{" "}
          <span className="font-bold text-ink tabular-nums">₹{formattedAmount}</span>
        </p>
        <p className="text-12 text-ink-3 mt-1">{invoiceNo}</p>
        <p className="text-11 text-ink-3 mt-0.5">{timeLabel}</p>
      </div>

      {/* Unread indicator — self-start prevents stretch distortion */}
      {unread && <NotificationDot withHalo className="self-start mt-2" />}
    </button>
  )
}

export { NotificationItem }
