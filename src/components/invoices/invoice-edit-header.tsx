import { Edit } from "@/components/icons";
import { PageHeader } from "@/components/ui/custom/page-header";
import { StatusPill } from "@/components/ui/custom/status-pill";

interface InvoiceEditHeaderProps {
  id: string;
  customer: string;
}

export function InvoiceEditHeader({ id, customer }: InvoiceEditHeaderProps) {
  return (
    <PageHeader
      backHref={`/invoices/${id}`}
      backLabel="Back to invoice"
      title="Edit invoice"
      subtitle={`#${id} · ${customer}`}
      actions={
        <StatusPill status="draft" className="self-start before:hidden">
          <Edit className="size-2.75" aria-hidden /> DRAFT
        </StatusPill>
      }
    />
  );
}
