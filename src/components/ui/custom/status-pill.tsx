import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide whitespace-nowrap before:inline-block before:size-1.5 before:rounded-full before:bg-current before:opacity-80",
  {
    variants: {
      status: {
        draft: "bg-draft-soft text-draft-ink",
        sent: "bg-info-soft text-info",
        viewed: "bg-info-soft text-info",
        partial: "bg-pending-soft text-pending-ink",
        pending: "bg-pending-soft text-pending-ink",
        overdue: "bg-overdue-soft text-overdue-ink",
        paid: "bg-paid-soft text-paid-ink",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  }
)

export type StatusPillStatus = NonNullable<
  VariantProps<typeof statusPillVariants>["status"]
>

const STATUS_LABEL: Record<StatusPillStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partial: "Partial",
  pending: "Pending",
  overdue: "Overdue",
  paid: "Paid",
}

function StatusPill({
  className,
  status = "draft",
  children,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof statusPillVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(statusPillVariants({ status }), className),
        children: children ?? STATUS_LABEL[status ?? "draft"],
      },
      props
    ),
    render,
    state: { slot: "status-pill", status },
  })
}

export { StatusPill, statusPillVariants }
