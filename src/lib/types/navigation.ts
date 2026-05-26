import type React from "react"

export interface MobileTab {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  active?: boolean
  isPrimary?: boolean
}
