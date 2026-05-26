import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar"
import { Topbar } from "@/components/ui/custom/topbar"
import { InvoicesFilterShell } from "@/components/invoices/invoices-filter-shell"
import { InvoicesPageHeader } from "@/components/invoices/invoices-page-header"
import { INVOICES } from "@/lib/constants"

export function InvoicesContainer() {
  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Invoices" subtitle="All your invoices" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <InvoicesFilterShell
          invoices={INVOICES}
          header={<InvoicesPageHeader />}
        />
      </div>
      <MobileTabBar />
    </div>
  )
}
