import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";

import { getPublicInvoice } from "@/lib/pay/get-public-invoice";
import { PublicInvoiceRpcSchema } from "@/lib/schema/pay";
import { buildUpiIntent, buildUpiQrSvg } from "@/lib/pay/upi";
import logger from "@/lib/logger";

import { PayCard } from "./pay-card";
import { PayHeader } from "./pay-header";
import { PayInvoiceMeta } from "./pay-invoice-meta";
import { PayLineItems } from "./pay-line-items";
import { PayTotals } from "./pay-totals";
import { PayUpiCard } from "./pay-upi-card";
import { PayPaidState } from "./pay-paid-state";

const PublicLineItemSchema = z.object({
  position: z.number().int(),
  name: z.string(),
  hsn_sac: z.string().nullable(),
  qty: z.number(),
  unit_price: z.number().int(),
  discount: z.number().int(),
  gst_rate: z.number().nullable(),
  line_subtotal: z.number().int(),
  line_tax: z.number().int(),
  line_total: z.number().int(),
});

export type PublicLineItem = z.infer<typeof PublicLineItemSchema>;

interface PayContainerProps {
  token: string;
}

export async function PayContainer({ token }: PayContainerProps) {
  const rpcData = await getPublicInvoice(token);

  if (rpcData === null) {
    notFound();
  }

  const parsed = PublicInvoiceRpcSchema.safeParse(rpcData);
  if (!parsed.success) {
    logger.error({ issues: parsed.error.issues.length }, "pay/page: RPC payload parse failed");
    notFound();
  }

  const invoice = parsed.data;
  const amountDue = invoice.total - invoice.amount_paid;

  const lineItems = invoice.line_items
    .map((item) => PublicLineItemSchema.safeParse(item))
    .filter((r) => r.success)
    .map((r) => r.data);

  let upiIntent: string | null = null;
  let upiQrSvg: string | null = null;

  const hasUpi =
    typeof invoice.business_upi_id === "string" && invoice.business_upi_id.trim() !== "";

  if (hasUpi && amountDue > 0) {
    upiIntent = buildUpiIntent({
      payeeVpa: invoice.business_upi_id!,
      payeeName: invoice.business_name,
      amountPaise: amountDue,
      note: invoice.invoice_number,
    });
    upiQrSvg = await buildUpiQrSvg(upiIntent);
  }

  return (
    <div className="min-h-screen bg-background py-8 max-mobile:py-4">
      <main
        id="main-content"
        className="mx-auto w-full max-w-2xl px-4"
        aria-label="Invoice payment"
      >
        <div className="flex flex-col gap-5">
          <PayHeader
            businessName={invoice.business_name}
            businessLogoUrl={invoice.business_logo_url}
            businessGstin={invoice.business_gstin}
            invoiceNumber={invoice.invoice_number}
            status={invoice.status}
          />

          <PayInvoiceMeta
            customerName={invoice.customer_name}
            issueDate={invoice.issue_date}
            dueDate={invoice.due_date}
          />

          <PayLineItems lineItems={lineItems} gstEnabled={invoice.gst_enabled} />

          <PayTotals
            subtotal={invoice.subtotal}
            discount={invoice.discount}
            cgst={invoice.cgst}
            sgst={invoice.sgst}
            igst={invoice.igst}
            roundOff={invoice.round_off}
            total={invoice.total}
            amountPaid={invoice.amount_paid}
            amountDue={amountDue}
            isInterstate={invoice.is_interstate}
            gstEnabled={invoice.gst_enabled}
          />

          {amountDue <= 0 ? (
            <PayPaidState amountPaid={invoice.amount_paid} invoiceNumber={invoice.invoice_number} />
          ) : hasUpi && upiIntent && upiQrSvg ? (
            <PayUpiCard
              upiIntent={upiIntent}
              upiQrSvg={upiQrSvg}
              amountDue={amountDue}
              invoiceNumber={invoice.invoice_number}
            />
          ) : (
            <PayCard className="border border-border px-5 py-4">
              <p className="text-center text-body-sm text-ink-2">
                Contact the business to arrange payment.
              </p>
            </PayCard>
          )}

          {invoice.terms ? (
            <p className="rounded-xl bg-surface-2 px-5 py-4 text-caption text-ink-2">
              <span className="font-semibold text-ink">Terms: </span>
              {invoice.terms}
            </p>
          ) : null}

          <footer className="pb-6 pt-2 text-center text-label text-ink-3">
            Powered by{" "}
            <span className="font-bold text-coral-ink">
              arthapatra
              <span aria-hidden="true" className="text-coral">
                .
              </span>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
