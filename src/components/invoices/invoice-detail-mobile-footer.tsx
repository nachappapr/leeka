import { Bell, Check, Edit, WhatsApp } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";
import { InvoiceDetailMobileSheet } from "./invoice-detail-mobile-sheet";

interface InvoiceDetailMobileFooterProps {
  invoiceId: string;
  status: StatusPillStatus;
}

// Sticky bottom action bar on mobile. Sits directly at the bottom of the
// viewport — MobileTabBar is removed from invoice detail pages.
export function InvoiceDetailMobileFooter({
  invoiceId,
  status,
}: InvoiceDetailMobileFooterProps) {
  const isPaid = status === "paid";
  const isDraft = status === "draft";

  if (isPaid) {
    return (
      <footer
        aria-label="Invoice actions"
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
      >
        <PillButton tone="whatsapp" size="lg" className="flex-1 rounded-lg!">
          <WhatsApp aria-hidden />
          Send receipt
        </PillButton>
        <InvoiceDetailMobileSheet invoiceId={invoiceId} status={status} />
      </footer>
    );
  }

  if (isDraft) {
    return (
      <footer
        aria-label="Invoice actions"
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
      >
        <PillButton tone="outline" size="lg" className="flex-1 rounded-lg!">
          <Edit aria-hidden />
          Edit
        </PillButton>
        <PillButton tone="primary" size="lg" className="flex-1 roun¯d¯¯ed-lg!">
          <Check strokeWidth={2.4} aria-hidden />
          Send invoice
        </PillButton>
        <InvoiceDetailMobileSheet invoiceId={invoiceId} status={status} />
      </footer>
    );
  }

  return (
    <footer
      aria-label="Invoice actions"
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
    >
      <PillButton tone="outline" size="lg" className="flex-1 rounded-lg!">
        <Bell aria-hidden />
        Remind
      </PillButton>
      <PillButton tone="primary" size="lg" className="flex-1 rounded-lg!">
        <Check strokeWidth={2.4} aria-hidden />
        Mark paid
      </PillButton>
      <InvoiceDetailMobileSheet invoiceId={invoiceId} status={status} />
    </footer>
  );
}
