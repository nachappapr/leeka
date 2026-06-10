import { PageHeader } from "@/components/ui/custom/page-header";
import { CustomerAddTrigger } from "@/components/customers/customer-add-trigger";

interface CustomersPageHeaderProps {
  totalCount: number;
  totalOutstanding: string | null;
}

export function CustomersPageHeader({ totalCount, totalOutstanding }: CustomersPageHeaderProps) {
  const subtitle = totalOutstanding
    ? `${totalCount} saved · ${totalOutstanding} outstanding across all`
    : `${totalCount} saved`;

  return (
    <PageHeader
      title="Customers"
      subtitle={subtitle}
      actions={<CustomerAddTrigger />}
      actionsOnMobile
    />
  );
}
