import { Plus } from "@/components/icons"
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
    <header className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-26 font-black tracking-snug text-ink max-mobile:text-title">
          Customers
        </h2>
        <p className="text-body-sm font-medium text-ink-3">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 max-mobile:hidden">
        <PillButton tone="primary" size="lg">
          <Plus aria-hidden />
          Add customer
        </PillButton>
      </div>
    </header>
  )
}
