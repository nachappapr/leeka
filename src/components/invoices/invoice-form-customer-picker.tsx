// No "use client": purely presentational — branches on value prop, owns no hooks.
// Rides the client boundary of the parent (InvoiceFormBody → invoice forms).

import type { SelectedCustomer } from "@/lib/types/customer";

import { InvoiceFormCustomerSearchCombobox } from "./invoice-form-customer-search-combobox";
import { InvoiceFormCustomerSelectedChip } from "./invoice-form-customer-selected-chip";

export interface InvoiceFormCustomerPickerProps {
  value: SelectedCustomer | null;
  onSelect: (c: SelectedCustomer) => void;
  onClear: () => void;
}

export function InvoiceFormCustomerPicker({
  value,
  onSelect,
  onClear,
}: InvoiceFormCustomerPickerProps) {
  if (value) {
    return <InvoiceFormCustomerSelectedChip value={value} onClear={onClear} />;
  }
  return <InvoiceFormCustomerSearchCombobox onSelect={onSelect} />;
}
