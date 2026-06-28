import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { Card } from "@/components/ui/custom/card";
import { StatusPill } from "@/components/ui/custom/status-pill";
import {
  DataTable,
  DataHeader,
  DataHead,
  DataBody,
  DataCell,
} from "@/components/ui/custom/data-table";
import { formatInvoiceDate } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import { invoiceDetailHref } from "@/lib/invoice/invoice-detail-href";

interface CustomerInvoicesCardProps {
  customerName: string;
  invoices: Invoice[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export function CustomerInvoicesCard({ customerName, invoices }: CustomerInvoicesCardProps) {
  return (
    <Card title="Invoices" headingLevel={3}>
      {invoices.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <div className="text-body-sm font-bold text-ink-2">No invoices yet</div>
          <div className="mt-1 text-caption text-ink-3">
            Send your first invoice to {customerName}.
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="max-mobile:hidden">
            <DataTable aria-label={`Invoices for ${customerName}`}>
              <DataHeader>
                <tr className="cursor-default border-b border-border bg-background hover:bg-background">
                  <DataHead className="w-2/5 pl-6">Invoice #</DataHead>
                  <DataHead className="w-1/5">Issued</DataHead>
                  <DataHead className="w-1/5">Status</DataHead>
                  <DataHead className="w-1/5 pr-6 text-right">Amount</DataHead>
                </tr>
              </DataHeader>
              <DataBody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="relative border-b border-border transition-colors hover:bg-coral/5 last:border-b-0"
                  >
                    <DataCell className="pl-6">
                      {/* Stretched link covers the full row */}
                      <Link
                        href={invoiceDetailHref(inv)}
                        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-coral-press focus-visible:after:ring-inset"
                      >
                        <span className="text-body-sm font-semibold text-ink">{inv.id}</span>
                      </Link>
                    </DataCell>
                    <DataCell>
                      <span className="text-body-sm text-ink-2">
                        {formatInvoiceDate(inv.isoDate)}
                      </span>
                    </DataCell>
                    <DataCell>
                      <StatusPill status={inv.status} />
                    </DataCell>
                    <DataCell className="pr-6 text-right">
                      <span className="tabular text-body-sm font-bold text-ink">{inv.amount}</span>
                    </DataCell>
                  </tr>
                ))}
              </DataBody>
            </DataTable>
          </div>

          {/* Mobile card list */}
          <ul
            aria-label={`Invoices for ${customerName}`}
            className="flex flex-col min-mobile:hidden"
          >
            {invoices.map((inv) => {
              const initials = getInitials(inv.customer);
              return (
                <li key={inv.id} className="border-t border-border first:border-t-0">
                  <Link
                    href={invoiceDetailHref(inv)}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-coral/5 active:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-inset"
                  >
                    <Avatar className="size-9 shrink-0 bg-coral-soft">
                      <AvatarFallback className="bg-coral-soft text-body-sm font-bold text-coral-ink">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm font-semibold text-ink">{inv.customer}</div>
                      <div className="mt-0.5 text-label text-ink-3">
                        {inv.id} · {formatInvoiceDate(inv.isoDate)}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="tabular text-body-sm font-bold text-ink">{inv.amount}</span>
                      <StatusPill status={inv.status} size="sm" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
