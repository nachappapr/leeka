"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import * as React from "react";

import { ExportInvoicesModal } from "@/components/invoices/export-invoices-modal";
import { INVOICE_SORTS } from "@/lib/constants/invoices";
import type { Invoice } from "@/lib/types";
import type { InvoiceSortId } from "@/lib/types/invoice";
import type { InvoiceStatusFilter } from "@/lib/types/invoice";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";
import type { ExportFormat, ExportStatusId } from "@/lib/types/invoice-export";

const VALID_EXPORT_STATUS_IDS: ReadonlyArray<ExportStatusId> = [
  "all",
  "paid",
  "sent",
  "viewed",
  "overdue",
  "draft",
] as const;

interface InvoiceListActionsContextValue {
  sort: InvoiceSortId;
  statuses: ReadonlyArray<StatusPillStatus>;
  setSort: (id: InvoiceSortId) => void;
  setStatuses: (statuses: StatusPillStatus[]) => void;
  sortLabel: string;
  filterLabel: string;
  exportOpen: boolean;
  /**
   * Opens the export modal. `format` defaults to "pdf" (preserves mobile sheet behaviour).
   * `focusRef` is the element to restore focus to when the modal closes.
   */
  openExport: (format?: ExportFormat, focusRef?: React.RefObject<HTMLElement | null>) => void;
  closeExport: () => void;
  invoices: ReadonlyArray<Invoice>;
  /** Desktop single-select chip filter value; default "all". */
  desktopFilter: InvoiceStatusFilter;
  setDesktopFilter: (filter: InvoiceStatusFilter) => void;
  /** Whether the current business is on the Pro plan — gates GST export. */
  isProUser: boolean;
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
  /** Controlled desktop chip filter value — caller owns state and drives re-fetches. */
  desktopFilter: InvoiceStatusFilter;
  /** Called when the user clicks a chip; caller updates state + triggers re-fetch. */
  onDesktopFilterChange: (filter: InvoiceStatusFilter) => void;
  /** Whether the current business is on the Pro plan. Passed from a Server Component. */
  isProUser?: boolean;
}

export function InvoiceListActionsProvider({
  children,
  invoices,
  desktopFilter,
  onDesktopFilterChange,
  isProUser = false,
}: InvoiceListActionsProviderProps) {
  const [sort, setSort] = useState<InvoiceSortId>("newest");
  const [statuses, setStatuses] = useState<StatusPillStatus[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [announce, setAnnounce] = useState("");
  const [exportFinalFocus, setExportFinalFocus] =
    useState<React.RefObject<HTMLElement | null> | null>(null);

  // Incremented each time the modal opens so the modal remounts with fresh
  // state (key-reset pattern — avoids setState-in-effect lint violations).
  const openKeyRef = useRef(0);
  const [openKey, setOpenKey] = useState(0);

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

  const openExport = useMemo(
    () =>
      (format: ExportFormat = "pdf", focusRef?: React.RefObject<HTMLElement | null>) => {
        openKeyRef.current += 1;
        setOpenKey(openKeyRef.current);
        setExportFormat(format);
        setExportFinalFocus(focusRef ?? null);
        setExportOpen(true);
      },
    [],
  );

  // Compute initial statuses to seed the modal: mobile statuses take priority,
  // then fall back to the desktop chip filter (if not "all"), else "all".
  const exportInitialStatuses = useMemo<ReadonlyArray<ExportStatusId>>(() => {
    if (statuses.length > 0) {
      const validSet = new Set<string>(VALID_EXPORT_STATUS_IDS);
      const valid = statuses.reduce<ExportStatusId[]>((acc, s) => {
        if (validSet.has(s)) acc.push(s as ExportStatusId);
        return acc;
      }, []);
      return valid.length > 0 ? valid : ["all"];
    }
    if (desktopFilter !== "all") {
      const validSet = new Set<string>(VALID_EXPORT_STATUS_IDS);
      return validSet.has(desktopFilter) ? [desktopFilter as ExportStatusId] : ["all"];
    }
    return ["all"];
  }, [statuses, desktopFilter]);

  const value = useMemo<InvoiceListActionsContextValue>(
    () => ({
      sort,
      statuses,
      setSort,
      setStatuses,
      sortLabel,
      filterLabel,
      exportOpen,
      openExport,
      closeExport: () => setExportOpen(false),
      invoices,
      desktopFilter,
      setDesktopFilter: onDesktopFilterChange,
      isProUser,
    }),
    [
      sort,
      statuses,
      sortLabel,
      filterLabel,
      exportOpen,
      openExport,
      invoices,
      desktopFilter,
      onDesktopFilterChange,
      isProUser,
    ],
  );

  return (
    <InvoiceListActionsContext.Provider value={value}>
      {children}
      <ExportInvoicesModal
        key={openKey}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        invoices={invoices}
        initialFormat={exportFormat}
        initialStatuses={exportInitialStatuses}
        finalFocus={exportFinalFocus ?? undefined}
        onAnnounce={setAnnounce}
      />
      <p role="status" aria-live="polite" aria-atomic className="sr-only">
        {announce}
      </p>
    </InvoiceListActionsContext.Provider>
  );
}
