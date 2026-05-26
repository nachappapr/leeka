import React from "react"

import { cn } from "@/lib/utils"
import { Card as CardPrimitive } from "@/components/ui/primitives/card"

// ── Brand Card wrapper ────────────────────────────────────────────────────────
// Overrides the shadcn primitive defaults (rounded-xl → rounded-2xl, removes
// gap-4, py-4, and ring-1 ring-foreground/10) to match the Lekka visual contract.
// Header block is rendered internally; children receive no extra padding.

export interface CardProps {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  headingLevel?: 2 | 3
}

export function Card({ title, children, action, className, headingLevel = 2 }: CardProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3"
  return (
    <CardPrimitive
      className={cn(
        "rounded-2xl bg-card shadow-card gap-0 py-0 ring-0 overflow-hidden",
        className
      )}
    >
      {title || action ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
          {title ? (
            <Heading className="text-body font-extrabold tracking-snug text-ink">
              {title}
            </Heading>
          ) : null}
          {action}
        </div>
      ) : null}
      {children}
    </CardPrimitive>
  )
}
