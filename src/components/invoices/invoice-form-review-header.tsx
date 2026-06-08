// No "use client": presentational, attaches passed-in callbacks only. Rides the
// parent client boundary (the invoice forms) without needing its own directive.

import type React from "react"

import { ChevronLeft, Download, Edit } from "@/components/icons"
import { IconButton } from "@/components/ui/custom/icon-button"
import { PillButton } from "@/components/ui/custom/pill-button"

interface InvoiceFormReviewHeaderProps {
  customerName?: string
  onBack: () => void
  /**
   * Ref to the heading element so the parent can programmatically focus it
   * when entering the review view (WCAG 2.4.3 focus management).
   * tabIndex={-1} is set on the heading so it is programmatically focusable
   * without entering the natural tab order.
   */
  headingRef?: React.RefObject<HTMLHeadingElement | null>
}

// Page header shown when the user is in the review (preview) view of the invoice
// create/edit flow. Mirrors the visual tokens of PageHeader (text-h2 role +
// body-sm subtitle) but uses a button for back navigation (not a Link) since
// it transitions view state, not routes.
export function InvoiceFormReviewHeader({
  customerName,
  onBack,
  headingRef,
}: InvoiceFormReviewHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* Back button — button (not Link) because back navigates view state.
            border-ink-3 (#6f6253) instead of border-border (#ece3d4): passes
            WCAG 1.4.11 non-text contrast (5.92:1 vs 1.27:1). */}
        <IconButton
          type="button"
          tone="ghost"
          size="md"
          aria-label="Back to edit"
          onClick={onBack}
          className="shrink-0 border border-ink-3 bg-card text-ink-2 hover:border-line-strong hover:bg-coral/5 hover:text-coral-press size-10 rounded-full"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </IconButton>

        <div className="min-w-0">
          {/* h2: matches the edit view's heading level (PageHeader uses h2).
              tabIndex={-1} makes this programmatically focusable (WCAG 2.4.3)
              without inserting it into the natural tab order. */}
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="truncate text-h2 font-extrabold text-ink focus-visible:outline-none"
          >
            Review invoice
          </h2>
          <p className="mt-0.5 text-body-sm font-medium text-ink-3">
            This is exactly what{" "}
            <strong className="font-semibold">
              {customerName ?? "your customer"}
            </strong>{" "}
            will see.
          </p>
        </div>
      </div>

      {/* Desktop-only action buttons — hidden on mobile (mobile bar provides them) */}
      <div className="flex shrink-0 items-center gap-2 max-mobile:hidden">
        <PillButton tone="outline" size="sm" type="button" onClick={onBack}>
          <Edit aria-hidden />
          Edit
        </PillButton>
        <PillButton tone="outline" size="sm" type="button" aria-label="Download PDF">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>
    </header>
  )
}
