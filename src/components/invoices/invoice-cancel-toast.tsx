"use client";

// Justified "use client": fires brandToast (client-only Sonner call) and owns a
// grace-window countdown timer.

import { toast } from "sonner";
import { RotateCcw } from "@/components/icons";
import { brandToast } from "@/components/ui/custom/brand-toast";

const CANCEL_GRACE_SECONDS = 5;

function renderCancelToast(
  toastId: string,
  invoiceId: string,
  remaining: number,
  onUndo: () => void,
) {
  brandToast.warn({
    id: toastId,
    title: "Invoice cancelled",
    sub: `${invoiceId} · cancelling in ${remaining}s`,
    duration: Infinity,
    actions: [
      {
        label: `Undo (${remaining})`,
        primary: true,
        icon: <RotateCcw className="size-3.5" aria-hidden />,
        onClick: onUndo,
      },
    ],
  });
}

/**
 * Optimistic cancel toast — Cancel is irreversible (it voids the live pay link),
 * so instead of a confirm-first prompt the cancel is shown as already done and
 * the real dispatch is deferred by a grace window. A live countdown ticks the
 * remaining seconds down; Undo before it hits zero clears the timer so the
 * dispatch never fires, otherwise it commits on timeout.
 */
export function fireCancelInvoiceToast(invoiceId: string, onCommit: () => void) {
  const toastId = `cancel-invoice-${invoiceId}`;
  let remaining = CANCEL_GRACE_SECONDS;

  const intervalId = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(intervalId);
      toast.dismiss(toastId);
      onCommit();
      return;
    }
    renderCancelToast(toastId, invoiceId, remaining, () => clearInterval(intervalId));
  }, 1000);

  renderCancelToast(toastId, invoiceId, remaining, () => clearInterval(intervalId));
}
