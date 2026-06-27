// No "use client": presentational composition — no hooks/state of its own.
// InvoiceFormReviewDesktopBar (client) and InvoiceFormLivePreview (client) are
// composed here; their own boundaries are sufficient.

import type { Invoice, SaveDraftOutcome } from "@/lib/types";

import type { InvoiceFormLivePreviewItem } from "./invoice-form-live-preview";
import { InvoiceFormLivePreview } from "./invoice-form-live-preview";
import { InvoiceFormReviewDesktopBar } from "./invoice-form-review-desktop-bar";

// Props union: InvoiceFormLivePreview's props + the invoice object for the
// send modal and the onBack callback for the desktop bar.
interface InvoiceFormReviewStageProps {
  // InvoiceFormLivePreview props
  invoiceIdNoHash: string;
  customerName: string;
  phone: string;
  items: ReadonlyArray<InvoiceFormLivePreviewItem>;
  subtotal: number;
  total: number;
  /** Intra-state CGST in paise. */
  cgst: number;
  /** Intra-state SGST in paise. */
  sgst: number;
  /** Inter-state IGST in paise. */
  igst: number;
  /** Round-off in paise (may be negative). */
  roundOff: number;
  isoDate: string;
  dueIsoDate: string;
  accentColor?: string;
  footerMessage?: string;
  // Review-stage-specific props
  invoice: Invoice;
  onBack: () => void;
  onSaveDraft: () => Promise<SaveDraftOutcome>;
}

// Centered column that hosts the live preview + desktop action bar in the
// review (preview) view. Design ref: .create-preview-stage (web.css:1679).
// max-width 760px → max-w-190 (190 × 4 = 760px). Gap: 18px desktop / 14px
// mobile → gap-4.5 / max-mobile:gap-3.5 (4.5 × 4 = 18px, 3.5 × 4 = 14px).
export function InvoiceFormReviewStage({
  invoiceIdNoHash,
  customerName,
  phone,
  items,
  subtotal,
  total,
  cgst,
  sgst,
  igst,
  roundOff,
  isoDate,
  dueIsoDate,
  accentColor,
  footerMessage,
  invoice,
  onBack,
  onSaveDraft,
}: InvoiceFormReviewStageProps) {
  return (
    <div className="mx-auto flex w-full max-w-190 flex-col gap-4.5 max-mobile:gap-3.5">
      <InvoiceFormLivePreview
        invoiceIdNoHash={invoiceIdNoHash}
        customerName={customerName}
        phone={phone}
        items={items}
        subtotal={subtotal}
        total={total}
        cgst={cgst}
        sgst={sgst}
        igst={igst}
        roundOff={roundOff}
        isoDate={isoDate}
        dueIsoDate={dueIsoDate}
        accentColor={accentColor}
        footerMessage={footerMessage}
      />

      <InvoiceFormReviewDesktopBar invoice={invoice} onBack={onBack} onSaveDraft={onSaveDraft} />
    </div>
  );
}
