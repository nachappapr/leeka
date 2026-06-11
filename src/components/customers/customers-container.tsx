import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { Card } from "@/components/ui/custom/card";
import { EmptyTableState } from "@/components/ui/custom/empty-table-state";
import { CustomersPageHeader } from "@/components/customers/customers-page-header";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersMobileList } from "@/components/customers/customers-mobile-list";
import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";

async function fetchCustomers(): Promise<Customer[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  const businessId = member?.business_id;
  if (!businessId) return [];

  // customers table not yet in generated Database types — cast required until next type-gen run
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any)
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("name");

  if (error || !rows) return [];

  return (
    rows as Array<{
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      gstin: string | null;
      billing_address: string | null;
      city: string | null;
      created_at: string;
    }>
  ).map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? undefined,
    gstin: row.gstin ?? undefined,
    address: row.billing_address ?? undefined,
    city: row.city ?? undefined,
    invoiceCount: 0,
    totalBilled: "₹0",
    outstanding: null,
    paid: "₹0",
    customerSince: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : undefined,
  }));
}

export async function CustomersContainer() {
  const customers = await fetchCustomers();
  const hasCustomers = customers.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Customers" subtitle="All your customers" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        {hasCustomers ? (
          <>
            <CustomersPageHeader totalCount={customers.length} totalOutstanding={null} />
            <Card>
              <CustomersTable customers={customers} />
              <div className="p-4 min-mobile:hidden">
                <CustomersMobileList customers={customers} />
              </div>
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
