import type React from "react"

export interface MobileTab {
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  href: string
  isPrimary?: boolean
}
