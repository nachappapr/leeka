import type React from "react"
import { cn } from "@/lib/utils"

interface CustomerContactRowProps {
  icon: React.ReactNode
  label: string
  value: string | undefined
  isFirst?: boolean
}

export function CustomerContactRow({
  icon,
  label,
  value,
  isFirst = false,
}: CustomerContactRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2.5",
        !isFirst && "border-t border-border",
      )}
    >
      {/* 32px icon tile */}
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-kicker font-extrabold uppercase tracking-wider text-ink-3">
          {label}
        </div>
        {value ? (
          <div className="mt-0.5 break-words text-body-sm font-semibold text-ink">
            {value}
          </div>
        ) : (
          <div className="mt-0.5 text-body-sm font-medium italic text-ink-3">
            Not added
          </div>
        )}
      </div>
    </div>
  )
}
