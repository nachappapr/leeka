import type { Metadata } from "next";
import { PayContainer } from "@/components/pay/pay-container";

export const metadata: Metadata = {
  title: "Pay Invoice — ArthaPatra",
  robots: { index: false, follow: false },
};

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PayContainer token={token} />;
}
