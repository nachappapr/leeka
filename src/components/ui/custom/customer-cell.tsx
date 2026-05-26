import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"

export interface CustomerCellProps {
  customer: string
  city: string
  className?: string
}

export function CustomerCell({ customer, city, className }: CustomerCellProps) {
  const initials = customer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className="bg-coral-soft">
        <AvatarFallback className="bg-coral-soft text-coral-ink text-body-sm font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="text-body-sm font-semibold text-ink">{customer}</div>
        <div className="text-label text-ink-3">{city}</div>
      </div>
    </div>
  )
}
