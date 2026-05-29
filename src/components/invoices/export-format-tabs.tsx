"use client"

import { useRef } from "react"
import type { KeyboardEvent } from "react"

import { FileText, Download } from "@/components/icons"
import { cn } from "@/lib/utils"
import { EXPORT_FORMAT_OPTS } from "@/lib/constants/invoice-export"
import type { ExportFormat } from "@/lib/types/invoice-export"

interface ExportFormatTabsProps {
  value: ExportFormat
  onChange: (format: ExportFormat) => void
  /** ID of an external FieldLabel that names this group (avoids double-labelling). */
  labelledById?: string
}

export function ExportFormatTabs({ value, onChange, labelledById }: ExportFormatTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const radios = containerRef.current?.querySelectorAll('[role="radio"]')
    if (!radios) return
    const arr = Array.from(radios) as HTMLElement[]
    const currentIdx = arr.findIndex((el) => el === document.activeElement)
    if (currentIdx === -1) return

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      const next = (currentIdx + 1) % arr.length
      onChange(EXPORT_FORMAT_OPTS[next].id)
      arr[next].focus()
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      const prev = (currentIdx - 1 + arr.length) % arr.length
      onChange(EXPORT_FORMAT_OPTS[prev].id)
      arr[prev].focus()
    } else if (e.key === "Home") {
      e.preventDefault()
      onChange(EXPORT_FORMAT_OPTS[0].id)
      arr[0].focus()
    } else if (e.key === "End") {
      e.preventDefault()
      onChange(EXPORT_FORMAT_OPTS[EXPORT_FORMAT_OPTS.length - 1].id)
      arr[arr.length - 1].focus()
    }
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-labelledby={labelledById}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 gap-2 p-1 bg-background border border-line rounded-lg max-mobile:grid-cols-1"
    >
      {EXPORT_FORMAT_OPTS.map((opt) => {
        const isActive = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-nav-item border text-left font-sans transition-[background-color,border-color,color]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              isActive
                ? "bg-card border-line-strong text-ink shadow-[0_1px_0_rgba(31,26,20,0.04)]"
                : "bg-transparent border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {opt.id === "csv" ? (
              <FileText size={16} aria-hidden className="shrink-0" />
            ) : (
              <Download size={16} aria-hidden className="shrink-0" />
            )}
            <span className="flex flex-col leading-tight min-w-0">
              <span className="text-body-sm font-black">{opt.label}</span>
              <span className="text-11 font-medium text-ink-3 mt-0.5">{opt.sub}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
