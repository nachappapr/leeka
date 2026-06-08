import { WhatsApp, Mail, IndianRupee, Home } from "@/components/icons"
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"
import { Card } from "@/components/ui/custom/card"
import { PillButton } from "@/components/ui/custom/pill-button"
import { CustomerContactRow } from "@/components/customers/customer-contact-row"
import type { Customer } from "@/lib/types"

interface CustomerContactCardProps {
  customer: Customer
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
}

export function CustomerContactCard({ customer }: CustomerContactCardProps) {
  const initials = getInitials(customer.name)

  return (
    <Card className="p-6">
      {/* Hero row */}
      <div className="flex items-center gap-3.5">
        <Avatar className="size-18 shrink-0 bg-coral-soft">
          <AvatarFallback className="bg-coral-soft text-title-sm font-bold text-coral-ink">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="break-words text-title-sm font-bold text-ink">
            {customer.name}
          </div>
          <div className="mt-1 text-label text-ink-3">
            {customer.customerSince
              ? `Customer since ${customer.customerSince}`
              : "Customer since —"}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4.5 border-t border-border" />

      {/* Contact rows */}
      <div>
        <CustomerContactRow
          icon={<WhatsApp aria-hidden className="size-4" />}
          label="Phone"
          value={customer.phone}
          isFirst
        />
        <CustomerContactRow
          icon={<Mail aria-hidden className="size-4" />}
          label="Email"
          value={customer.email}
        />
        <CustomerContactRow
          icon={<IndianRupee aria-hidden className="size-4" />}
          label="GSTIN"
          value={customer.gstin}
        />
        <CustomerContactRow
          icon={<Home aria-hidden className="size-4" />}
          label="Billing address"
          value={customer.address}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-4.5 flex gap-2">
        <PillButton tone="outline" size="sm" className="flex-1">
          <WhatsApp aria-hidden className="size-4" />
          WhatsApp
        </PillButton>
        <PillButton tone="outline" size="sm" className="flex-1">
          <Mail aria-hidden className="size-4" />
          Email
        </PillButton>
      </div>
    </Card>
  )
}
