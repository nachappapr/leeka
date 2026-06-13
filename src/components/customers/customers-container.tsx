import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { Card } from "@/components/ui/custom/card";
import { EmptyTableState } from "@/components/ui/custom/empty-table-state";
import { CustomersPageHeader } from "@/components/customers/customers-page-header";
import { CustomersListClient } from "@/components/customers/customers-list-client";
import { fetchCustomersFirstPage } from "@/lib/data/customer";

export async function CustomersContainer() {
  const firstPage = await fetchCustomersFirstPage(25);
  const hasCustomers = firstPage.rows.length > 0 || firstPage.nextCursor !== null;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar
        title="Customers"
        subtitle="All your customers"
        notificationsSlot={<TopbarNotifications />}
      />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        {hasCustomers ? (
          <>
            <CustomersPageHeader totalCount={firstPage.rows.length} totalOutstanding={null} />
            <Card>
              <CustomersListClient
                initialRows={firstPage.rows}
                initialNextCursor={firstPage.nextCursor}
              />
            </Card>
          </>
        ) : (
          <>
            <CustomersPageHeader totalCount={0} totalOutstanding={null} />
            <Card>
              <EmptyTableState
                icon="Users"
                title="No customers yet"
                body="Add your first customer — name and phone is enough. You can fill in GSTIN & address later."
                primary={{ label: "Add customer", href: "/customers", icon: "Plus" }}
              />
            </Card>
          </>
        )}
      </div>
      <MobileTabBar />
    </div>
  );
}
