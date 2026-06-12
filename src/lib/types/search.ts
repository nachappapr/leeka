export type RecentSearchEntry = {
  label: string;
  type: "invoice" | "customer";
  id: string;
};

export type SearchScope = "all" | "invoices" | "customers";

export type SearchInvoiceHit = {
  kind: "invoice";
  id: string;
  invoiceUuid: string;
  number: string | null;
  customerName: string | null;
  isoDate: string;
  amount: string;
  totalPaise: number;
  status: string;
};

export type SearchCustomerHit = {
  kind: "customer";
  id: string;
  name: string;
  phone: string | null;
};

export type SearchResults = {
  invoices: SearchInvoiceHit[];
  customers: SearchCustomerHit[];
};

export const EMPTY_SEARCH_RESULTS: SearchResults = {
  invoices: [],
  customers: [],
};
