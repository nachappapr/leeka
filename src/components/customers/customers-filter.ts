import { type FilterFn } from "@tanstack/react-table";

import type { Customer } from "@/lib/types";

export const customerFilter: FilterFn<Customer> = (row, _columnId, filterValue: string) => {
  const q = filterValue.toLowerCase();
  return (
    row.original.name.toLowerCase().includes(q) ||
    (row.original.city ?? "").toLowerCase().includes(q) ||
    row.original.phone.toLowerCase().includes(q)
  );
};
