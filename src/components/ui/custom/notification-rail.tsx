import { cn } from "@/lib/utils"
import type { NotificationTone } from "@/lib/types/notifications"

const TONE_BG: Record<NotificationTone, string> = {
  paid: "bg-paid",
  pending: "bg-pending",
  overdue: "bg-overdue",
  info: "bg-info",
  // bg-whatsapp-press (#006653) replaces bg-whatsapp (#008069) for the dot: uses the darker press tone for the decorative rail; #006653 on white panel surface is ~6.9:1, well above the 3:1 threshold for non-text elements (WCAG 1.4.11).
  whatsapp: "bg-whatsapp-press",
  customer: "bg-coral",
  draft: "bg-draft",
  sent: "bg-pending",
}

interface NotificationRailProps {
  tone: NotificationTone
  className?: string
}

/**
 * NotificationRail — thin vertical tone-colored accent bar.
 *
 * Purely decorative; aria-hidden="true" is mandatory.
 * Consumer row must be `flex items-stretch` for h-full to work.
 */
function NotificationRail({ tone, className }: NotificationRailProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0",
        "w-1 h-full min-h-10",
        "rounded-full",
        TONE_BG[tone],
        className
      )}
    />
  )
}

export { NotificationRail }
