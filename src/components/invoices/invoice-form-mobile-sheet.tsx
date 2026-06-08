"use client"

import type React from "react"
import { useId } from "react"

import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/primitives/sheet"

export interface InvoiceFormSheetItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  danger?: boolean
}

export interface InvoiceFormMobileSheetProps {
  open: boolean
  onClose: () => void
  title: string
  items: InvoiceFormSheetItem[]
  /**
   * Ref of the element that opened the sheet (e.g. the ⋯ button).
   * Base UI uses this to restore focus on close (WCAG 2.4.3 / APG Dialog).
   * Pass this from every consumer; without it focus returns to document.body.
   */
  triggerRef?: React.RefObject<HTMLElement | null>
}

const ACTION_CLASS =
  "flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-body font-semibold text-ink transition-colors active:bg-background hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral-press"

const ICON_CLASS =
  "flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-background text-ink-2"

export function InvoiceFormMobileSheet({
  open,
  onClose,
  title,
  items,
  triggerRef,
}: InvoiceFormMobileSheetProps) {
  const titleId = useId()
  const normalItems = items.filter((item) => !item.danger)
  const dangerItems = items.filter((item) => item.danger)
  const hasBothGroups = normalItems.length > 0 && dangerItems.length > 0

  return (
    // No min-mobile:hidden wrapper here — this renders into a portal, so a
    // display:none ancestor has no effect on the portaled panel. Desktop-hiding
    // is enforced by the consumer: the action bars that open this sheet are
    // themselves hidden on desktop (min-mobile:hidden), so this sheet is never
    // opened except on mobile.
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-labelledby={titleId}
        className="rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        finalFocus={triggerRef}
      >
          {/* Handle — width 40px, height 4px, margin 6px auto 12px */}
          <div
            className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong"
            aria-hidden
          />

          {/* Kicker title — 11px/800, padding 0 22px 10px */}
          <p
            id={titleId}
            className="px-5.5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3"
          >
            {title}
          </p>

          {/* Items list */}
          <ul>
            {normalItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={item.onClick}
                  className={ACTION_CLASS}
                >
                  {/* aria-hidden: button name comes from item.label, not the icon */}
                  <span aria-hidden className={ICON_CLASS}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}

            {hasBothGroups && (
              <li role="separator" aria-hidden>
                <hr className="mx-5.5 my-2 border-line" />
              </li>
            )}

            {dangerItems.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    "flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-body font-semibold transition-colors active:bg-background hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
                    "text-overdue focus-visible:ring-overdue"
                  )}
                >
                  {/* aria-hidden: button name comes from item.label, not the icon */}
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-overdue-soft text-overdue">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Cancel — margin 10px 14px 0, height 50px → h-12, radius 14px → rounded-lg */}
          {/* Raw <button onClick={onClose}> is intentional under the controlled pattern:
              Sheet is driven by open/onClose props, not by SheetClose/SheetTrigger.
              Using <SheetClose> here would attempt to fire Base UI's internal close
              action, duplicating the close and bypassing the caller's onClose handler. */}
          <div className="px-3.5 pt-2.5 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="h-12 w-full rounded-lg bg-background text-body font-bold text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>
  )
}
