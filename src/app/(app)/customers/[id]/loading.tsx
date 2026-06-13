import { CustomerDetailSkeleton } from "@/components/customers/customer-detail-skeleton";

export default function CustomerDetailLoading() {
  return (
    <div role="status" aria-label="Loading customer" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <CustomerDetailSkeleton />
    </div>
  );
}
