import type { Metadata } from "next";
import { PayContainer } from "@/components/pay/pay-container";

// 60-second ISR TTL. The viewed-event guard in get_public_invoice is idempotent
// (fires only when viewed_at IS NULL), so repeated revalidation renders are safe.
// Staleness risk: after record_payment runs, a cached render shows "due" for up to
// 60 s. On-demand revalidation is deferred to the record-payment lane (Epic 17).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pay Invoice — ArthaPatra",
  robots: { index: false, follow: false },
};

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PayContainer token={token} />;
}
