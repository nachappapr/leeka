import { Plus } from "@/components/icons"
import { PageHeader } from "@/components/ui/custom/page-header"
import { PillButton } from "@/components/ui/custom/pill-button"

interface CustomersPageHeaderProps {
  totalCount: number
  totalOutstanding: string | null
}

export function CustomersPageHeader({
  totalCount,
  totalOutstanding,
}: CustomersPageHeaderProps) {
  const subtitle = totalOutstanding
    ? `${totalCount} saved · ${totalOutstanding} outstanding across all`
    : `${totalCount} saved`

  return (
    <PageHeader
      title="Customers"
      subtitle={subtitle}
      actions={
        <PillButton tone="primary" size="md">
          <Plus aria-hidden />
          Add customer
        </PillButton>
      }
    />
  )
}
