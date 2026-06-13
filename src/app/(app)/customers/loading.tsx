import { CustomersSkeleton } from "@/components/customers/customers-skeleton";

export default function CustomersLoading() {
  return (
    <div role="status" aria-label="Loading customers" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <CustomersSkeleton />
    </div>
  );
}
