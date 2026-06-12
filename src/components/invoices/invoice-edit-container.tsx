import { notFound } from "next/navigation";

import { getBusinessGstContext } from "@/lib/data/business";
import { getDraftInvoice } from "@/lib/data/invoice";
import { Topbar } from "@/components/ui/custom/topbar";

import { InvoiceEditForm } from "./invoice-edit-form";

interface InvoiceEditContainerProps {
  id: string;
}

export async function InvoiceEditContainer({ id }: InvoiceEditContainerProps) {
  const [draft, gstContext] = await Promise.all([getDraftInvoice(id), getBusinessGstContext()]);
  if (!draft) notFound();

  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);

  const isoDate = draft.isoDate;
  const dueIsoDate = draft.dueIsoDate ?? due.toISOString().split("T")[0];

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Edit invoice" subtitle={`#${id.toUpperCase()}`} />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <InvoiceEditForm
          draft={draft}
          isoDate={isoDate}
          dueIsoDate={dueIsoDate}
          businessGstEnabled={gstContext?.gstEnabled ?? false}
          businessStateCode={gstContext?.stateCode ?? null}
        />
      </div>
    </div>
  );
}
