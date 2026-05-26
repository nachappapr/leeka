import { cn } from "@/lib/utils"

interface NotificationDotProps {
  withHalo?: boolean
  className?: string
}

function NotificationDot({ withHalo = false, className }: NotificationDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 align-middle",
        "w-2 h-2",
        "rounded-full",
        "bg-coral",
        withHalo && "ring-3 ring-coral-soft",
        className
      )}
    />
  )
}

export { NotificationDot }
