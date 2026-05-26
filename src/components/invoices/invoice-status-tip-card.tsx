import * as React from "react"

import { Check, Clock, Info } from "@/components/icons"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

interface InvoiceStatusTipCardProps {
  status: StatusPillStatus
}

interface Tone {
  cardBg: string
  iconBg: string
  text: string
  icon: React.ReactNode
  title: string
  body: string
}

function toneFor(status: StatusPillStatus): Tone {
  if (status === "paid") {
    return {
      cardBg: "bg-paid-soft",
      iconBg: "bg-paid",
      text: "text-paid-ink",
      icon: <Check className="size-5" strokeWidth={2.4} aria-hidden />,
      title: "Paid in full",
      body: "Payment received. Send a thank-you receipt to your customer.",
    }
  }
  if (status === "overdue") {
    return {
      cardBg: "bg-overdue-soft",
      iconBg: "bg-overdue",
      text: "text-overdue-ink",
      icon: <Clock className="size-5" aria-hidden />,
      title: "Overdue · 3 days",
      body: "Send a friendly nudge — most customers pay within a day of a reminder.",
    }
  }
  if (status === "draft") {
    return {
      cardBg: "bg-draft-soft",
      iconBg: "bg-draft",
      text: "text-draft-ink",
      icon: <Info className="size-5" aria-hidden />,
      title: "Not sent yet",
      body: "Send this invoice to your customer to start the payment clock.",
    }
  }
  return {
    cardBg: "bg-pending-soft",
    iconBg: "bg-pending",
    text: "text-pending-ink",
    icon: <Info className="size-5" aria-hidden />,
    title: "Due in 7 days",
    body: "Send a gentle reminder 2 days before to nudge prompt payment.",
  }
}

export function InvoiceStatusTipCard({ status }: InvoiceStatusTipCardProps) {
  const tone = toneFor(status)
  return (
    <aside
      aria-label="Invoice status tip"
      className={`rounded-2xl p-5 shadow-card ${tone.cardBg} ${tone.text}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-nav-item text-white ${tone.iconBg}`}
        >
          {tone.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-body-sm font-black">{tone.title}</h3>
          <p className="mt-0.5 text-caption leading-normal">{tone.body}</p>
        </div>
      </div>
    </aside>
  )
}
