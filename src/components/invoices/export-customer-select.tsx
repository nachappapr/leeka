"use client";

import { Users } from "@/components/icons";
import { BrandSelect } from "@/components/ui/custom/brand-select";
import type { BrandSelectOption } from "@/components/ui/custom/brand-select";

interface ExportCustomerSelectProps {
  customer: string;
  setCustomer: (v: string) => void;
  uniqueCustomers: string[];
}

export function ExportCustomerSelect({
  customer,
  setCustomer,
  uniqueCustomers,
}: ExportCustomerSelectProps) {
  const options: BrandSelectOption[] = [
    { value: "all", label: `All customers (${uniqueCustomers.length})` },
    ...uniqueCustomers.map((name) => ({ value: name, label: name })),
  ];

  return (
    <BrandSelect
      value={customer}
      onValueChange={setCustomer}
      options={options}
      leadingIcon={<Users size={16} aria-hidden />}
      ariaLabel="Filter by customer"
    />
  );
}
