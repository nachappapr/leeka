import { CUSTOMERS } from "@/lib/constants/customers"

// The shape of a customer row as returned by the CUSTOMERS constant.
// Used by the combobox dropdown and search combobox to type match results.
export type FilteredCustomer = (typeof CUSTOMERS)[number]

export interface Customer {
  id: string
  name: string
  city?: string
  phone: string
  invoiceCount: number
  totalBilled: string
  outstanding: string | null
}

// The minimal customer shape the invoice form's CustomerPicker selects/holds.
// `last` is an optional "last invoice …" hint not present on every record.
export interface SelectedCustomer {
  name: string
  phone: string
  last?: string
}
