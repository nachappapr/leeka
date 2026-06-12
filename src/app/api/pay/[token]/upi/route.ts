import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PublicInvoiceRpcSchema } from "@/lib/schema/pay";
import { buildUpiIntent, buildUpiQrSvg } from "@/lib/pay/upi";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;

  if (!token || typeof token !== "string" || token.trim() === "") {
    return Response.json({ ok: false, error: "Invalid token" }, { status: 404 });
  }

  const supabase = await createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_invoice", {
    p_token: token,
  });

  if (rpcError) {
    logger.error({ err: { code: rpcError.code } }, "pay/upi: RPC error");
    return Response.json({ ok: false, error: "Failed to load invoice" }, { status: 500 });
  }

  if (rpcData === null) {
    return Response.json({ ok: false, error: "Invoice not found or unavailable" }, { status: 404 });
  }

  const parsed = PublicInvoiceRpcSchema.safeParse(rpcData);
  if (!parsed.success) {
    logger.error({ issues: parsed.error.issues.length }, "pay/upi: RPC payload parse failed");
    return Response.json({ ok: false, error: "Unexpected invoice payload" }, { status: 500 });
  }

  const invoice = parsed.data;

  if (!invoice.business_upi_id || invoice.business_upi_id.trim() === "") {
    return Response.json(
      { ok: false, error: "UPI payments are not available for this business" },
      { status: 409 },
    );
  }

  const amountDue = invoice.total - invoice.amount_paid;

  if (amountDue <= 0) {
    return Response.json(
      { ok: false, error: "This invoice has no outstanding balance" },
      { status: 409 },
    );
  }

  const intentUrl = buildUpiIntent({
    payeeVpa: invoice.business_upi_id,
    payeeName: invoice.business_name,
    amountPaise: amountDue,
    note: invoice.invoice_number,
  });

  const qrSvg = await buildUpiQrSvg(intentUrl);

  return Response.json({
    ok: true,
    data: {
      intent_url: intentUrl,
      qr_svg: qrSvg,
      amount_due: amountDue,
      invoice_number: invoice.invoice_number,
      payee_name: invoice.business_name,
      payee_vpa: invoice.business_upi_id,
    },
  });
}
