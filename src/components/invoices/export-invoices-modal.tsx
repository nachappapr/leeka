"use client";

import { useCallback, useState } from "react";
import type React from "react";

import { XIcon, Download } from "@/components/icons";
import { cn, parseRupeeString } from "@/lib/utils";
import { INVOICES } from "@/lib/constants/invoices";
import { EXPORT_DATE_PRESETS, EXPORT_STATUS_CHIPS } from "@/lib/constants/invoice-export";
import { buildExportUrl } from "@/lib/invoice/export-url";
import { ExportFormatTabs } from "@/components/invoices/export-format-tabs";
import { ExportSummaryBox } from "@/components/invoices/export-summary-box";
import { ExportChip } from "@/components/invoices/export-chip";
import { ExportDateRange } from "@/components/invoices/export-date-range";
import { ExportCustomerSelect } from "@/components/invoices/export-customer-select";
import { ExportColumnChips } from "@/components/invoices/export-column-chips";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { FieldLabel } from "@/components/ui/custom/field-label";
import type { Invoice } from "@/lib/types";
import type {
  ExportColState,
  ExportDateRangeId,
  ExportFormat,
  ExportStatusId,
} from "@/lib/types/invoice-export";

export interface ExportInvoicesModalProps {
  open: boolean;
  onClose: () => void;
  initialFormat?: ExportFormat;
  /** Status chips pre-seeded from the active list filters. Reset on each open via key-reset. */
  initialStatuses?: ReadonlyArray<ExportStatusId>;
  invoices?: ReadonlyArray<Invoice>;
  /** Element to restore focus to when the modal closes (WCAG 2.4.3). */
  finalFocus?: React.RefObject<HTMLElement | null>;
  /** Called with the download announcement string before onClose fires (Finding 3). */
  onAnnounce?: (message: string) => void;
}

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ExportInvoicesModal({
  open,
  onClose,
  initialFormat = "csv",
  initialStatuses = ["all"],
  invoices = INVOICES,
  finalFocus,
  onAnnounce,
}: ExportInvoicesModalProps) {
  const [format, setFormat] = useState<ExportFormat>(initialFormat);
  const [range, setRange] = useState<ExportDateRangeId>("this-month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statuses, setStatuses] = useState<ReadonlyArray<ExportStatusId>>(initialStatuses);
  const [customer, setCustomer] = useState("all");
  const [cols, setCols] = useState<ExportColState>({ items: true, tax: true, notes: false });

  const toggleStatus = useCallback((id: ExportStatusId) => {
    if (id === "all") {
      setStatuses(["all"]);
      return;
    }
    setStatuses((prev) => {
      const base = prev.filter((x) => x !== "all" && x !== id);
      if (prev.includes(id)) return base.length ? base : ["all"];
      return [...base, id];
    });
  }, []);

  const uniqueCustomers = Array.from(new Set(invoices.map((i) => i.customer))).sort();
  const matches = invoices.filter((i) => {
    const okStatus =
      statuses.includes("all") || (statuses as ReadonlyArray<string>).includes(i.status);
    return okStatus && (customer === "all" || i.customer === customer);
  });
  const totalAmt = matches.reduce((s, i) => s + parseRupeeString(i.amount), 0);
  const rangeLabel = EXPORT_DATE_PRESETS.find((r) => r.id === range)?.label ?? "This month";
  const datePart =
    range === "custom" && (from || to)
      ? `${from || "open"}_to_${to || "open"}`
      : slugify(rangeLabel);
  const filename = `arthapatra-invoices-${datePart}.${format}`;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (format === "csv") {
        const url = buildExportUrl({ statuses, range, from, to, customer });
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        onAnnounce?.(`Downloading ${filename} — ${matches.length} invoices`);
      }
      // PDF path: close only — Epic 8 is deferred.
      onClose();
    },
    [format, statuses, range, from, to, customer, filename, matches.length, onClose, onAnnounce],
  );

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <ModalContent finalFocus={finalFocus}>
        <form onSubmit={handleSubmit} className="contents">
          <ModalHeader>
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-coral-soft text-coral-ink text-kicker font-black tracking-wider uppercase rounded-full px-2.5 py-1 mb-2.5">
                Export · {format.toUpperCase()}
              </div>
              <ModalTitle>Export invoices</ModalTitle>
              <ModalDescription>
                Choose what to include. We&apos;ll narrow the file to just the invoices that match.
              </ModalDescription>
            </div>
            <ModalClose aria-label="Close export dialog" />
          </ModalHeader>

          <ModalBody>
            <section className="mb-4.5">
              <FieldLabel id="export-format-label">Format</FieldLabel>
              <ExportFormatTabs
                value={format}
                onChange={setFormat}
                labelledById="export-format-label"
              />
            </section>

            <section className="mb-4.5">
              <FieldLabel id="export-daterange-label">Date range</FieldLabel>
              <div
                role="group"
                aria-labelledby="export-daterange-label"
                className="flex flex-wrap gap-2"
              >
                {EXPORT_DATE_PRESETS.map((r) => (
                  <ExportChip
                    key={r.id}
                    active={range === r.id}
                    onClick={() => setRange(r.id)}
                    {...(r.id === "custom" ? { "aria-expanded": range === "custom" } : {})}
                  >
                    {r.label}
                  </ExportChip>
                ))}
              </div>
              {range === "custom" && (
                <ExportDateRange from={from} setFrom={setFrom} to={to} setTo={setTo} />
              )}
            </section>

            <section className="mb-4.5">
              <FieldLabel id="export-status-label">Status</FieldLabel>
              <div
                role="group"
                aria-labelledby="export-status-label"
                className="flex flex-wrap gap-2"
              >
                {EXPORT_STATUS_CHIPS.map((s) => (
                  <ExportChip
                    key={s.id}
                    active={statuses.includes(s.id)}
                    onClick={() => toggleStatus(s.id)}
                    ariaPressed
                  >
                    {s.dot && (
                      <span
                        aria-hidden
                        className={cn(
                          "inline-block size-1.5 rounded-full shrink-0",
                          s.dot,
                          statuses.includes(s.id) && "shadow-[0_0_0_2px_rgba(255,255,255,0.3)]",
                        )}
                      />
                    )}
                    {s.label}
                  </ExportChip>
                ))}
              </div>
            </section>

            <section className="mb-4.5">
              <FieldLabel id="export-customer-label">Customer</FieldLabel>
              <div role="group" aria-labelledby="export-customer-label">
                <ExportCustomerSelect
                  customer={customer}
                  setCustomer={setCustomer}
                  uniqueCustomers={uniqueCustomers}
                />
              </div>
            </section>

            {format === "csv" && (
              <section className="mb-4.5">
                <FieldLabel id="export-cols-label">Include columns</FieldLabel>
                <div role="group" aria-labelledby="export-cols-label">
                  <ExportColumnChips cols={cols} setCols={setCols} />
                </div>
              </section>
            )}

            <ExportSummaryBox matchCount={matches.length} totalAmt={totalAmt} filename={filename} />
          </ModalBody>

          <ModalFooter>
            <button
              type="button"
              aria-label="Cancel export"
              onClick={onClose}
              className="flex-none flex items-center justify-center gap-2 h-12 px-3.5 rounded-lg bg-card border-[1.5px] border-ink-3 text-ink text-body font-bold transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1 max-mobile:w-12 max-mobile:px-0"
            >
              <XIcon size={18} aria-hidden />
              <span className="max-mobile:hidden">Cancel</span>
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 h-12 min-w-0 rounded-lg bg-primary text-white text-body font-bold shadow-press transition-[background-color,opacity] hover:bg-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
            >
              <Download size={18} strokeWidth={2.4} aria-hidden />
              Export {format.toUpperCase()}
            </button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
