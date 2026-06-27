import { getBusinessGstContext, getBusinessTemplate } from "@/lib/data/business";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";

import { InvoiceCreateForm } from "./invoice-create-form";

export async function InvoiceCreateContainer() {
  const [gstContext, template] = await Promise.all([
    getBusinessGstContext(),
    getBusinessTemplate(),
  ]);

  // new Date() must follow an uncached/request data read so Cache Components
  // treats this render as dynamic rather than baking a build-time timestamp.
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);

  const isoDate = today.toISOString().split("T")[0];
  const dueIsoDate = due.toISOString().split("T")[0];

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Create invoice" notificationsSlot={<TopbarNotifications />} />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <InvoiceCreateForm
          isoDate={isoDate}
          dueIsoDate={dueIsoDate}
          businessGstEnabled={gstContext?.gstEnabled ?? false}
          businessStateCode={gstContext?.stateCode ?? null}
          businessDefaultGstRate={gstContext?.defaultGstRate ?? 18}
          accentColor={template?.accentColor ?? "#F46A39"}
          footerMessage={template?.footerMessage ?? "Thank you for your business!"}
        />
      </div>
    </div>
  );
}
