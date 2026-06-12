// Presentational wrapper (no hooks/state) — rides the client boundary of the
// invoice forms that compose it; receives their live RHF values as props.
// Adds the "What your customer sees" eyebrow + a UI-only PDF button over the
// scaled-down live preview.

import { Download } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";

import type { InvoiceFormLivePreviewItem } from "./invoice-form-live-preview";
import { InvoiceFormLivePreview } from "./invoice-form-live-preview";

interface InvoiceFormPreviewSidebarProps {
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
}

export function InvoiceFormPreviewSidebar(props: InvoiceFormPreviewSidebarProps) {
  return (
    <div>
      {/* Eyebrow row */}
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-kicker font-extrabold uppercase tracking-wide text-ink-3">
          What your customer sees
        </p>
        {/* UI-only PDF button — no handler yet. TODO: generate PDF */}
        <PillButton
          tone="ghost"
          size="sm"
          type="button"
          aria-label="Download PDF"
          className="min-h-6 gap-1 px-2 text-label text-ink-3"
        >
          <Download className="size-3.5" aria-hidden />
          PDF
        </PillButton>
      </div>
      <InvoiceFormLivePreview {...props} />
    </div>
  );
}
