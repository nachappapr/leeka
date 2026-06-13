import { InvoiceFormSkeleton } from "@/components/invoices/invoice-form-skeleton";

export default function InvoiceCreateLoading() {
  return (
    <div role="status" aria-label="Loading invoice form" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <InvoiceFormSkeleton />
    </div>
  );
}
