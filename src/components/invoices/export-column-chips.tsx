"use client"

import type { Dispatch, SetStateAction } from "react"

import { Check } from "@/components/icons"
import { cn } from "@/lib/utils"
import { EXPORT_COL_OPTS } from "@/lib/constants/invoice-export"
import type { ExportColState } from "@/lib/types/invoice-export"

interface ExportColumnChipsProps {
  cols: ExportColState
  setCols: Dispatch<SetStateAction<ExportColState>>
}

export function ExportColumnChips({ cols, setCols }: ExportColumnChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXPORT_COL_OPTS.map((c) => {
        const checked = cols[c.id]
        return (
          <label
            key={c.id}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-full border cursor-pointer transition-[background-color,border-color,color]",
              "focus-within:ring-2 focus-within:ring-coral-press focus-within:ring-offset-1",
              checked
                ? "bg-ink border-ink text-white"
                : "bg-card border-line-strong text-ink-2 hover:bg-surface-2",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) =>
                setCols((prev) => ({ ...prev, [c.id]: e.target.checked }))
              }
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "inline-flex items-center justify-center w-4 h-4 rounded-sm border-[1.5px] shrink-0 transition-[background-color,border-color]",
                checked ? "bg-primary border-primary" : "bg-card border-line-strong",
              )}
            >
              {checked && (
                <Check size={12} strokeWidth={3} className="text-white" aria-hidden />
              )}
            </span>
            <span className="text-caption font-semibold">{c.label}</span>
          </label>
        )
      })}
    </div>
  )
}
