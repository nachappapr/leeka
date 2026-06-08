import Link from "next/link"
import React from "react"

import { ChevronLeft } from "@/components/icons"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  backHref?: string
  backLabel?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  /**
   * Keep the actions visible on mobile (default: hidden ≤768, where primary
   * actions live in the topbar / tab bar). Opt in when a page has no other
   * mobile path to its action — e.g. "Add customer".
   */
  actionsOnMobile?: boolean
  className?: string
}

export function PageHeader({
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  actions,
  actionsOnMobile = false,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-ink-2 transition-colors hover:border-line-strong hover:bg-coral/5 hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-h2 font-extrabold text-ink">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-body-sm font-medium text-ink-3">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div
          className={cn(
            "flex shrink-0 items-center gap-2",
            !actionsOnMobile && "max-mobile:hidden",
          )}
        >
          {actions}
        </div>
      )}
    </header>
  )
}
