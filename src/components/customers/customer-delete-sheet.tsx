"use client";

// Justified "use client": interactive confirm buttons with onClick handlers.
import type * as React from "react";
import { Trash2 } from "@/components/icons";
import { Sheet, SheetContent } from "@/components/ui/primitives/sheet";
import type { Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CustomerDeleteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onDelete: (customer: Customer) => void;
  /** Ref to restore focus to when the sheet closes without confirming. */
  finalFocusRef?: React.RefObject<HTMLElement | null>;
}

export function CustomerDeleteSheet({
  open,
  onOpenChange,
  customer,
  onDelete,
  finalFocusRef,
}: CustomerDeleteSheetProps) {
  function handleDelete() {
    onDelete(customer);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        aria-labelledby="cust-delete-title"
        finalFocus={finalFocusRef}
      >
        <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

        <p className="px-5.5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3">
          {customer.name} · actions
        </p>

        <div className="px-5 pb-2">
          <p id="cust-delete-title" className="text-body-sm font-black text-ink mb-1.5">
            Delete this customer?
          </p>
          <p className="text-caption text-ink-2 mb-4 leading-relaxed">
            Their past invoices stay in your records, but they&apos;ll be removed from your saved
            customers list.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex-1 h-12 rounded-lg border-[1.5px] border-ink-3 bg-card",
                "text-body-sm font-bold text-ink transition-colors hover:bg-surface-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={cn(
                "flex-1 h-12 rounded-lg bg-overdue text-card",
                "text-body-sm font-bold transition-colors hover:bg-overdue-ink",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-overdue focus-visible:ring-offset-2",
                "inline-flex items-center justify-center gap-2",
              )}
            >
              <Trash2 className="size-4" aria-hidden />
              Yes, delete
            </button>
          </div>
          <div className="pb-[calc(16px+env(safe-area-inset-bottom,0))]" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
