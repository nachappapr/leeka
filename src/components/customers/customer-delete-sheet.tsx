"use client";

// Justified "use client": interactive confirm buttons with onClick handlers + pending state.
import type * as React from "react";
import { useState } from "react";
import { Loader2, Trash2 } from "@/components/icons";
import { Sheet, SheetContent } from "@/components/ui/primitives/sheet";
import type { Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CustomerDeleteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  /** Resolves to whether the delete succeeded; the sheet only closes on success. */
  onDelete: (customer: Customer) => Promise<boolean>;
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
  const [isDeleting, setIsDeleting] = useState(false);

  function handleCancel() {
    if (isDeleting) return;
    onOpenChange(false);
  }

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    let ok = false;
    try {
      ok = await onDelete(customer);
    } catch {
      // Treated as failure below; the delete handler chain (CustomerEditTrigger)
      // owns the error toast for both the {ok:false} and thrown-exception cases.
      ok = false;
    } finally {
      setIsDeleting(false);
    }
    if (ok) {
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={isDeleting ? undefined : onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        // z-90 (the above-modal layer, cf. brand-select): this sheet opens nested
        // inside CustomerFormModal, whose popup sits at z-81.
        className="z-90 rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        aria-labelledby="cust-delete-title"
        aria-describedby="cust-delete-desc"
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
          <p id="cust-delete-desc" className="text-caption text-ink-2 mb-4 leading-relaxed">
            Their past invoices stay in your records, but they&apos;ll be removed from your saved
            customers list.
          </p>
          <p role="status" aria-live="polite" className="sr-only">
            {isDeleting ? "Deleting…" : ""}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              aria-disabled={isDeleting}
              className={cn(
                "flex-1 h-12 rounded-lg border-[1.5px] border-ink-3 bg-card",
                "text-body-sm font-bold text-ink transition-colors hover:bg-surface-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
                "aria-disabled:pointer-events-none aria-disabled:opacity-50",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-disabled={isDeleting}
              aria-busy={isDeleting}
              className={cn(
                "flex-1 h-12 rounded-lg bg-overdue text-card",
                "text-body-sm font-bold transition-colors hover:bg-overdue-ink",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-overdue focus-visible:ring-offset-2",
                "inline-flex items-center justify-center gap-2",
                "aria-disabled:pointer-events-none aria-disabled:opacity-70",
              )}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
              ) : (
                <Trash2 className="size-4" aria-hidden />
              )}
              {isDeleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
          <div className="pb-[calc(16px+env(safe-area-inset-bottom,0))]" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
