"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { ExportInvoicesModal } from "@/components/invoices/export-invoices-modal";
import { INVOICE_SORTS } from "@/lib/constants/invoices";
import type { Invoice } from "@/lib/types";
import type { InvoiceSortId } from "@/lib/types/invoice";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

interface InvoiceListActionsContextValue {
  sort: InvoiceSortId;
  statuses: ReadonlyArray<StatusPillStatus>;
  setSort: (id: InvoiceSortId) => void;
  setStatuses: (statuses: StatusPillStatus[]) => void;
  sortLabel: string;
  filterLabel: string;
  exportOpen: boolean;
  openExport: () => void;
  closeExport: () => void;
  invoices: ReadonlyArray<Invoice>;
}

const InvoiceListActionsContext = createContext<InvoiceListActionsContextValue | null>(null);

export function useInvoiceListActions(): InvoiceListActionsContextValue {
  const ctx = useContext(InvoiceListActionsContext);
  if (!ctx) {
    throw new Error("useInvoiceListActions must be used inside <InvoiceListActionsProvider>");
  }
  return ctx;
}

interface InvoiceListActionsProviderProps {
  children: React.ReactNode;
  invoices: ReadonlyArray<Invoice>;
}

export function InvoiceListActionsProvider({
  children,
  invoices,
}: InvoiceListActionsProviderProps) {
  const [sort, setSort] = useState<InvoiceSortId>("newest");
  const [statuses, setStatuses] = useState<StatusPillStatus[]>([]);
  const [exportOpen, setExportOpen] = useState(false);

  const sortLabel = useMemo(
    () => INVOICE_SORTS.find((s) => s.id === sort)?.label ?? INVOICE_SORTS[0].label,
    [sort],
  );

  const filterLabel = useMemo(
    () =>
      statuses.length === 0
        ? "All statuses"
        : statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", "),
    [statuses],
  );

  const value = useMemo<InvoiceListActionsContextValue>(
    () => ({
      sort,
      statuses,
      setSort,
      setStatuses,
      sortLabel,
      filterLabel,
      exportOpen,
      openExport: () => setExportOpen(true),
      closeExport: () => setExportOpen(false),
      invoices,
    }),
    [sort, statuses, sortLabel, filterLabel, exportOpen, invoices],
  );

  return (
    <InvoiceListActionsContext.Provider value={value}>
      {children}
      <ExportInvoicesModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        invoices={invoices}
        initialFormat="pdf"
      />
    </InvoiceListActionsContext.Provider>
  );
}
