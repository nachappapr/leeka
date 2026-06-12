import { formatInvoiceDate } from "@/lib/utils";
import { PayCard } from "./pay-card";

interface PayInvoiceMetaProps {
  customerName: string | null;
  issueDate: string;
  dueDate: string | null;
}

interface MetaCellProps {
  label: string;
  value: string;
  dateTime?: string;
}

function MetaCell({ label, value, dateTime }: MetaCellProps) {
  return (
    <div>
      <dt className="text-kicker uppercase text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-body-sm font-semibold text-ink">
        {dateTime ? <time dateTime={dateTime}>{value}</time> : value}
      </dd>
    </div>
  );
}

export function PayInvoiceMeta({ customerName, issueDate, dueDate }: PayInvoiceMetaProps) {
  return (
    <PayCard
      as="section"
      aria-label="Invoice details"
      className="px-6 py-5 max-mobile:px-4 max-mobile:py-4"
    >
      <dl className="grid grid-cols-2 gap-4 max-mobile:grid-cols-1">
        {customerName ? <MetaCell label="Billed to" value={customerName} /> : null}
        <MetaCell label="Issue date" value={formatInvoiceDate(issueDate)} dateTime={issueDate} />
        {dueDate ? (
          <MetaCell label="Due date" value={formatInvoiceDate(dueDate)} dateTime={dueDate} />
        ) : null}
      </dl>
    </PayCard>
  );
}
