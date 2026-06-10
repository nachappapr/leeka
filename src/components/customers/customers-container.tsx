import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { Card } from "@/components/ui/custom/card";
import { EmptyStateSwitch } from "@/components/ui/custom/empty-state-switch";
import { EmptyTableState } from "@/components/ui/custom/empty-table-state";
import { CustomersPageHeader } from "@/components/customers/customers-page-header";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersMobileList } from "@/components/customers/customers-mobile-list";
import { CUSTOMERS } from "@/lib/constants";

function sumOutstanding(customers: typeof CUSTOMERS): string | null {
  const outstandingValues = customers
    .map((c) => c.outstanding)
    .filter((v): v is string => v !== null)
    .map((v) => parseInt(v.replace(/[₹,]/g, ""), 10));

  if (outstandingValues.length === 0) return null;

  const total = outstandingValues.reduce((a, b) => a + b, 0);
  return `₹${total.toLocaleString("en-IN")}`;
}

export function CustomersContainer() {
  const totalOutstanding = sumOutstanding(CUSTOMERS);

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Customers" subtitle="All your customers" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <EmptyStateSwitch
          empty={
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
          }
          populated={
            <>
              <CustomersPageHeader
                totalCount={CUSTOMERS.length}
                totalOutstanding={totalOutstanding}
              />
              <Card>
                <CustomersTable customers={CUSTOMERS} />
                <div className="p-4 min-mobile:hidden">
                  <CustomersMobileList customers={CUSTOMERS} />
                </div>
              </Card>
            </>
          }
        />
      </div>
      <MobileTabBar />
    </div>
  );
}
