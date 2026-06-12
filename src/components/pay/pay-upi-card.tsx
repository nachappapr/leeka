import Image from "next/image";

import { formatPaise } from "@/lib/utils";
import { PayCard } from "./pay-card";

interface PayUpiCardProps {
  upiIntent: string;
  upiQrSvg: string;
  amountDue: number;
  invoiceNumber: string;
}

export function PayUpiCard({ upiIntent, upiQrSvg, amountDue, invoiceNumber }: PayUpiCardProps) {
  const qrDataUrl = `data:image/svg+xml;base64,${Buffer.from(upiQrSvg).toString("base64")}`;

  return (
    <PayCard
      as="section"
      aria-label="UPI payment"
      className="px-6 py-5 max-mobile:px-4 max-mobile:py-4"
    >
      <h2 className="text-title-sm font-extrabold text-ink">Pay via UPI</h2>
      <p className="mt-1 text-caption text-ink-3">
        Scan the QR code with any UPI app or tap the button below.
      </p>

      <div className="mt-5 flex flex-col items-center gap-5">
        <div className="rounded-xl border border-border bg-white p-3">
          <Image
            src={qrDataUrl}
            alt={`UPI QR code for invoice ${invoiceNumber} — amount ${formatPaise(amountDue)}`}
            width={192}
            height={192}
            className="size-48"
            unoptimized
          />
        </div>

        <p className="text-body-sm font-semibold text-ink-2">
          Amount:{" "}
          <span className="tabular font-black text-coral-ink">{formatPaise(amountDue)}</span>
        </p>

        <a
          href={upiIntent}
          className="flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-coral px-6 text-body-sm font-bold text-ink shadow-coral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-press"
          aria-label={`Open UPI app to pay ${formatPaise(amountDue)} for invoice ${invoiceNumber}`}
        >
          Open UPI App
        </a>
      </div>
    </PayCard>
  );
}
