"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ExportChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  ariaPressed?: boolean
  "aria-expanded"?: boolean
}

export function ExportChip({
  active,
  onClick,
  children,
  ariaPressed,
  "aria-expanded": ariaExpanded,
}: ExportChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] px-3.5",
        "text-caption font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
        active
          ? "bg-ink text-white border-transparent"
          : "bg-card text-ink-2 border-ink-3 hover:bg-surface-2",
      )}
      {...(ariaPressed !== undefined ? { "aria-pressed": active } : {})}
      {...(ariaExpanded !== undefined ? { "aria-expanded": ariaExpanded } : {})}
    >
      {children}
    </button>
  )
}
