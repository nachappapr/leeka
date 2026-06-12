// No "use client": presentational composition riding the parent's client boundary.

import type React from "react";

import type { Invoice } from "@/lib/types";

import type { InvoiceFormLivePreviewItem } from "./invoice-form-live-preview";
import { InvoiceFormPreviewMobileBar } from "./invoice-form-preview-mobile-bar";
import { InvoiceFormReviewHeader } from "./invoice-form-review-header";
import { InvoiceFormReviewStage } from "./invoice-form-review-stage";

export interface InvoiceFormReviewViewProps {
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
  invoice: Invoice;
  onBack: () => void;
  onDiscard: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export function InvoiceFormReviewView({
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
  invoice,
  onBack,
  onDiscard,
  headingRef,
}: InvoiceFormReviewViewProps) {
  return (
    <>
      <InvoiceFormReviewHeader
        customerName={customerName}
        onBack={onBack}
        headingRef={headingRef}
      />
      <InvoiceFormReviewStage
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
        invoice={invoice}
        onBack={onBack}
      />
      <InvoiceFormPreviewMobileBar invoice={invoice} onEdit={onBack} onDiscard={onDiscard} />
    </>
  );
}
