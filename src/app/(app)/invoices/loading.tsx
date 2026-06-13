import { InvoicesSkeleton } from "@/components/invoices/invoices-skeleton";

export default function InvoicesLoading() {
  return (
    <div role="status" aria-label="Loading invoices" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <InvoicesSkeleton />
    </div>
  );
}
