// No "use client": presentational composition — no hooks/state of its own.
// InvoiceFormReviewDesktopBar (client) and InvoiceFormLivePreview (client) are
// composed here; their own boundaries are sufficient.

import type { Invoice } from "@/lib/types";

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
  taxTotal: number;
  total: number;
  isoDate: string;
  dueIsoDate: string;
  // Review-stage-specific props
  invoice: Invoice;
  onBack: () => void;
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
  taxTotal,
  total,
  isoDate,
  dueIsoDate,
  invoice,
  onBack,
}: InvoiceFormReviewStageProps) {
  return (
    <div className="mx-auto flex w-full max-w-190 flex-col gap-4.5 max-mobile:gap-3.5">
      <InvoiceFormLivePreview
        invoiceIdNoHash={invoiceIdNoHash}
        customerName={customerName}
        phone={phone}
        items={items}
        subtotal={subtotal}
        taxTotal={taxTotal}
        total={total}
        isoDate={isoDate}
        dueIsoDate={dueIsoDate}
      />

      <InvoiceFormReviewDesktopBar invoice={invoice} onBack={onBack} />
    </div>
  );
}
