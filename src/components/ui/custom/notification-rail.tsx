import { cn } from "@/lib/utils"
import type { NotificationTone } from "@/lib/types/notifications"

const TONE_BG: Record<NotificationTone, string> = {
  paid: "bg-paid",
  pending: "bg-pending",
  overdue: "bg-overdue",
  info: "bg-info",
  // bg-whatsapp-press (#1fae54) replaces bg-whatsapp (#25d366): brand bright green failed WCAG 1.4.11 against white panel surface (1.98:1); press tone passes at 3.38:1 while remaining clearly WhatsApp-brand-recognizable.
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
