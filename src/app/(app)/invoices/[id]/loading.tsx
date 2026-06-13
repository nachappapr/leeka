import { InvoiceDetailSkeleton } from "@/components/invoices/invoice-detail-skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div role="status" aria-label="Loading invoice" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <InvoiceDetailSkeleton />
    </div>
  );
}
