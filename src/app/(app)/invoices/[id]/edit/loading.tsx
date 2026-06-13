import { InvoiceFormSkeleton } from "@/components/invoices/invoice-form-skeleton";

export default function InvoiceEditLoading() {
  return (
    <div role="status" aria-label="Loading invoice editor" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <InvoiceFormSkeleton />
    </div>
  );
}
