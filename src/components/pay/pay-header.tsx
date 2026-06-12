import Image from "next/image";

import { StatusPill } from "@/components/ui/custom/status-pill";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";
import { PayCard } from "./pay-card";
import { cn } from "@/lib/utils/cn";

interface PayHeaderProps {
  businessName: string;
  businessLogoUrl: string | null;
  businessGstin: string | null;
  invoiceNumber: string;
  status: string;
}

function toStatusPillStatus(status: string): StatusPillStatus {
  const valid: StatusPillStatus[] = [
    "draft",
    "sent",
    "viewed",
    "partial",
    "pending",
    "overdue",
    "paid",
  ];
  return valid.includes(status as StatusPillStatus) ? (status as StatusPillStatus) : "viewed";
}

export function PayHeader({
  businessName,
  businessLogoUrl,
  businessGstin,
  invoiceNumber,
  status,
}: PayHeaderProps) {
  const pillStatus = toStatusPillStatus(status);

  return (
    <PayCard as="header" className="px-6 py-5 max-mobile:px-4 max-mobile:py-4">
      <div className="flex items-start justify-between gap-4 max-mobile:flex-col">
        <div className="flex items-center gap-3">
          {businessLogoUrl ? (
            <Image
              src={businessLogoUrl}
              alt={businessName}
              width={48}
              height={48}
              className="size-12 rounded-lg object-cover"
              unoptimized
            />
          ) : (
            <div
              aria-hidden="true"
              className={cn(
                "flex size-12 shrink-0 items-center justify-center",
                "rounded-lg bg-coral-press text-17 font-black text-white",
              )}
            >
              {businessName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-title-sm font-extrabold text-ink">{businessName}</h1>
            {businessGstin ? (
              <p className="text-caption text-ink-3">GSTIN {businessGstin}</p>
            ) : null}
          </div>
        </div>

        <div className="text-right max-mobile:text-left">
          <p className="text-kicker uppercase text-ink-3">Invoice</p>
          <p className="text-title-sm font-black tracking-snug text-coral-ink">{invoiceNumber}</p>
          <div className="mt-1.5">
            <StatusPill status={pillStatus} />
          </div>
        </div>
      </div>
    </PayCard>
  );
}
