import { CUSTOMERS } from "@/lib/constants/customers";

// The shape of a customer row as returned by the CUSTOMERS constant.
// Used by the combobox dropdown and search combobox to type match results.
export type FilteredCustomer = (typeof CUSTOMERS)[number];

export interface Customer {
  id: string;
  name: string;
  city?: string;
  phone: string;
  invoiceCount: number;
  totalBilled: string;
  outstanding: string | null;
  // Extended contact + profile fields (all optional — legacy records may omit)
  email?: string;
  gstin?: string;
  address?: string;
  customerSince?: string;
  paid?: string;
}

// Payload shape used by CustomerFormModal's onSave callback.
// All list fields plus the form-only opening balance.
export interface CustomerSavePayload {
  id?: string; // present on edit, absent on add (caller assigns)
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  openingBalance?: number; // add-mode only; absent on edit
}

// The minimal customer shape the invoice form's CustomerPicker selects/holds.
// `last` is an optional "last invoice …" hint not present on every record.
export interface SelectedCustomer {
  name: string;
  phone: string;
  last?: string;
}
