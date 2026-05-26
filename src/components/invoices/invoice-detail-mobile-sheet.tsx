"use client"

import Link from "next/link"
import type React from "react"

import { Clock, Copy, Download, Edit, MoreHorizontal, Share, Trash2 } from "@/components/icons"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/primitives/sheet"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

interface InvoiceDetailMobileSheetProps {
  invoiceId: string
  status: StatusPillStatus
}

interface SheetAction {
  icon: React.ReactNode
  label: string
  href?: string
}

function getActions(invoiceId: string, status: StatusPillStatus): SheetAction[] {
  const base: SheetAction[] = [
    { icon: <Edit className="size-4.5" aria-hidden />, label: "Edit invoice", href: `/invoices/${invoiceId.replace("#", "")}/edit` },
    { icon: <Download className="size-4.5" aria-hidden />, label: "Download PDF" },
    { icon: <Share className="size-4.5" aria-hidden />, label: "Share link" },
    { icon: <Copy className="size-4.5" aria-hidden />, label: "Duplicate" },
  ]
  if (status === "paid") {
    base.push({ icon: <Clock className="size-4.5" aria-hidden />, label: "Mark unpaid" })
  }
  return base
}

const ACTION_CLASS = "flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-15 font-semibold text-ink transition-colors active:bg-background hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral-press"
const ICON_CLASS = "flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-background text-ink-2"

export function InvoiceDetailMobileSheet({
  invoiceId,
  status,
}: InvoiceDetailMobileSheetProps) {
  const actions = getActions(invoiceId, status)

  return (
    <Sheet>
      <SheetTrigger
        aria-label="More actions"
        className="flex size-13 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink-3 bg-card text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
      >
        <MoreHorizontal className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        aria-labelledby="mobile-sheet-title"
      >
        {/* Handle — margin: 6px auto 12px per design */}
        <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

        {/* Title — 11px/800, padding: 0 22px 10px */}
        <p
          id="mobile-sheet-title"
          className="px-5.5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3"
        >
          {invoiceId} · Actions
        </p>

        {/* Main actions — padding: 14px 22px, gap: 14px, 15px/600 */}
        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              {action.href ? (
                <Link href={action.href} className={ACTION_CLASS}>
                  <span className={ICON_CLASS}>{action.icon}</span>
                  {action.label}
                </Link>
              ) : (
                <SheetClose className={ACTION_CLASS}>
                  <span className={ICON_CLASS}>{action.icon}</span>
                  {action.label}
                </SheetClose>
              )}
            </li>
          ))}
        </ul>

        {/* Divider — margin: 8px 22px */}
        <hr className="mx-5.5 my-2 border-border" />

        {/* Destructive — same layout, danger colours */}
        <SheetClose
          className="flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-15 font-semibold text-overdue transition-colors active:bg-background hover:bg-overdue-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-overdue"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-overdue-soft text-overdue">
            <Trash2 className="size-4.5" aria-hidden />
          </span>
          Delete invoice
        </SheetClose>

        {/* Cancel — margin: 10px 14px 0, height 50px→snap h-12, radius 14px */}
        <div className="px-3.5 pt-2.5 pb-4">
          <SheetClose
            className="h-12 w-full rounded-lg bg-background text-15 font-bold text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
          >
            Cancel
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
