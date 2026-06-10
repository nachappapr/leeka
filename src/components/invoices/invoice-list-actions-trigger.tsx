"use client";

import { useRef, useState } from "react";

import { MoreHorizontal } from "@/components/icons";
import { InvoiceListActionsSheet } from "@/components/invoices/invoice-list-actions-sheet";
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider";
import { cn } from "@/lib/utils";

export type ActionsView = "menu" | "sort" | "filter" | null;

export function InvoiceListActionsTrigger() {
  const [view, setView] = useState<ActionsView>(null);
  const { statuses } = useInvoiceListActions();

  const triggerRef = useRef<HTMLButtonElement>(null);

  const filtersActive = statuses.length > 0;
  const ariaLabel = filtersActive ? "More actions, filters active" : "More actions";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink-2",
          "transition-colors hover:bg-surface-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
          "min-mobile:hidden",
        )}
        onClick={() => setView("menu")}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
      >
        <MoreHorizontal className="size-5" aria-hidden />

        {/* Active indicator dot — color + aria-label change (non-color-only) */}
        {filtersActive && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-coral-press ring-1 ring-card"
          />
        )}
      </button>

      <InvoiceListActionsSheet view={view} onViewChange={setView} triggerRef={triggerRef} />
    </>
  );
}
