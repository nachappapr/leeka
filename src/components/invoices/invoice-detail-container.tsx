import { notFound, redirect } from "next/navigation";

import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { InvoiceActionsCard } from "@/components/invoices/invoice-actions-card";
import { InvoiceActivityCard } from "@/components/invoices/invoice-activity-card";
import { InvoiceDetailHeader } from "@/components/invoices/invoice-detail-header";
import { InvoiceDetailMobileFooter } from "@/components/invoices/invoice-detail-mobile-footer";
import { InvoicePreviewCard } from "@/components/invoices/invoice-preview-card";
import { InvoiceStatusTipCard } from "@/components/invoices/invoice-status-tip-card";
import { getInvoiceDetail } from "@/lib/data/invoice";
import { mapInvoiceDetailRow } from "@/lib/invoice/map-invoice-detail-row";
import { getBusinessTemplate } from "@/lib/data/business";

interface InvoiceDetailContainerProps {
  id: string;
}

export async function InvoiceDetailContainer({ id }: InvoiceDetailContainerProps) {
  const [row, template] = await Promise.all([getInvoiceDetail(id), getBusinessTemplate()]);

  const result = mapInvoiceDetailRow(row);

  if (result.kind === "not-found") notFound();
  if (result.kind === "redirect-edit") redirect(`/invoices/${id}/edit`);

  const invoice = result.detail;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Invoice" subtitle={invoice.id} notificationsSlot={<TopbarNotifications />} />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <InvoiceDetailHeader
          invoiceId={invoice.id}
          customer={invoice.customer}
          isoDate={invoice.isoDate}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-5 max-tablet:grid-cols-1">
          <InvoicePreviewCard
            invoice={invoice}
            accentColor={template?.accentColor ?? "#F46A39"}
            footerMessage={template?.footerMessage ?? "Thank you for your business!"}
          />

          <div className="flex flex-col gap-5">
            <div className="max-mobile:hidden">
              <InvoiceActionsCard invoice={invoice} />
            </div>
            <InvoiceActivityCard />
            <InvoiceStatusTipCard status={invoice.status} />
          </div>
        </div>
      </div>

      <InvoiceDetailMobileFooter invoice={invoice} />
    </div>
  );
}
