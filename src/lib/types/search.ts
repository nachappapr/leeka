export type RecentSearchEntry = {
  label: string;
  type: "invoice" | "customer";
  id: string;
};

export type SearchScope = "all" | "invoices" | "customers";
