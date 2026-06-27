"use client";

// Justified "use client": owns sendOpen + moreOpen states + moreRef for
// focus-restore.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Copy, Download, Edit, MoreHorizontal, Trash2, WhatsApp } from "@/components/icons";
import { IconButton } from "@/components/ui/custom/icon-button";
import { PillButton } from "@/components/ui/custom/pill-button";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import { brandToast } from "@/components/ui/custom/brand-toast";
import type { Invoice, SaveDraftOutcome } from "@/lib/types";

import { fireDraftSavedToast } from "./invoice-form-save-draft-button";
import type { InvoiceFormSheetItem } from "./invoice-form-mobile-sheet";
import { InvoiceFormMobileSheet } from "./invoice-form-mobile-sheet";

interface InvoiceFormPreviewMobileBarProps {
  invoice: Invoice;
  onEdit: () => void;
  onDiscard: () => void;
  onSaveDraft: () => Promise<SaveDraftOutcome>;
}

// Sticky mobile action bar shown while the user is reviewing the invoice (the
// preview/send view). Mirrors the invoice-detail footer pattern.
export function InvoiceFormPreviewMobileBar({
  invoice,
  onEdit,
  onDiscard,
  onSaveDraft,
}: InvoiceFormPreviewMobileBarProps) {
  const router = useRouter();
  const [sendOpen, setSendOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);

  const sheetItems: InvoiceFormSheetItem[] = [
    {
      label: "Save as draft",
      icon: <Edit className="size-4.5" aria-hidden />,
      onClick: async () => {
        setMoreOpen(false);
        setIsSavingDraft(true);
        try {
          const outcome = await onSaveDraft();
          if (outcome.ok) {
            fireDraftSavedToast(invoice, () => router.push("/invoices"));
          } else {
            brandToast.error({ title: outcome.error });
          }
        } finally {
          setIsSavingDraft(false);
        }
      },
    },
    {
      label: "Download PDF",
      icon: <Download className="size-4.5" aria-hidden />,
      onClick: () => {
        setMoreOpen(false);
        // TODO: PDF download (integration pass)
      },
    },
    {
      label: "Copy link",
      icon: <Copy className="size-4.5" aria-hidden />,
      onClick: () => {
        setMoreOpen(false);
        // TODO: copy link action (integration pass)
      },
    },
    {
      label: "Discard invoice",
      icon: <Trash2 className="size-4.5" aria-hidden />,
      onClick: () => {
        setMoreOpen(false);
        onDiscard();
      },
      danger: true,
    },
  ];

  return (
    <>
      {/* <footer> landmark is sufficient for orientation. role="toolbar" is
          dropped: it implies roving-tabindex arrow-key navigation we do not
          implement (APG Toolbar pattern). Tab access to the buttons is
          unchanged. */}
      <footer
        aria-label="Send invoice actions"
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
      >
        <div className="flex items-center gap-2">
          {/* Back-to-edit icon button — fixed width, not flex. size-11 aligns with
              the CTA height (h-11 = 44px). Border matches the outline look from the
              detail footer. */}
          <IconButton
            type="button"
            tone="ghost"
            size="lg"
            aria-label="Back to edit"
            onClick={onEdit}
            className="shrink-0 border border-ink-3"
          >
            <Edit aria-hidden />
          </IconButton>

          {/* WhatsApp send CTA — flex-1, full width */}
          <PillButton
            type="button"
            tone="whatsapp"
            size="md"
            className="flex-1 rounded-lg!"
            onClick={() => setSendOpen(true)}
          >
            <WhatsApp aria-hidden />
            Send on WhatsApp
          </PillButton>

          {/* ⋯ more-actions trigger — plain button (not SheetTrigger) so that the
              controlled InvoiceFormMobileSheet can handle focus-restore via triggerRef. */}
          <button
            ref={moreRef}
            type="button"
            aria-label="More actions"
            aria-busy={isSavingDraft}
            onClick={() => {
              if (!isSavingDraft) setMoreOpen(true);
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink-3 bg-card text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
          >
            <MoreHorizontal className="size-5" aria-hidden />
          </button>
        </div>
      </footer>

      <SendChannelsModal
        invoice={invoice}
        invoiceUuid={invoice.invoiceUuid ?? ""}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />

      <InvoiceFormMobileSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="Invoice · Actions"
        items={sheetItems}
        triggerRef={moreRef}
      />
    </>
  );
}
