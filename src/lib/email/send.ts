import "server-only";

import { serverEnv } from "@/lib/env.server";
import logger from "@/lib/logger";

export interface EmailSendParams {
  /** Recipient email address. Never logged — no PII in logs. */
  recipientEmail: string;
  /** Display invoice number shown in the email subject + body, e.g. "INV-001". */
  invoiceNumber: string;
  /** Absolute pay URL the CTA button navigates to. */
  payUrl: string;
  /** Customer display name for the greeting. */
  customerName: string;
}

export type EmailSendResult = { ok: true; providerMsgId: string } | { ok: false; error: string };

interface ResendApiResponseSuccess {
  id: string;
}

interface ResendApiResponseError {
  name: string;
  message: string;
  statusCode: number;
}

/**
 * POSTs a branded pay-link email to Resend's REST API.
 *
 * Email carries the pay link only — no PDF attachment. PDF delivery is
 * deferred to Epic 8 (AP-21), which is currently skipped.
 *
 * Uses raw fetch against https://api.resend.com/emails — no SDK dependency,
 * mirroring the WhatsApp send module's thin-fetch approach.
 *
 * Never logs recipientEmail, payUrl, or the API key — no PII/secrets in logs.
 */
export async function sendEmailInvoice(params: EmailSendParams): Promise<EmailSendResult> {
  const apiKey = serverEnv.RESEND_API_KEY;
  const from = serverEnv.EMAIL_FROM;

  if (!apiKey || !from) {
    return { ok: false, error: "Email not configured" };
  }

  const subject = `Invoice ${params.invoiceNumber} — ready to pay`;

  /*
   * Plain-text + minimal HTML email. The pay link is the only CTA — no PDF
   * attachment (Epic 8 deferred). HTML is intentionally simple so it renders
   * correctly across Indian webmail clients (Gmail, Outlook Web, Yahoo).
   */
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;color:#222;max-width:480px;margin:0 auto;padding:24px">
  <p>Hi ${params.customerName},</p>
  <p>Your invoice <strong>${params.invoiceNumber}</strong> is ready.</p>
  <p style="margin:24px 0">
    <a href="${params.payUrl}"
       style="background:#e8573a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:600">
      View &amp; Pay Invoice
    </a>
  </p>
  <p style="color:#666;font-size:14px">
    If the button doesn't work, copy and paste this link into your browser:<br>
    ${params.payUrl}
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#999;font-size:12px">Powered by ArthaPatra</p>
</body>
</html>`;

  const text = `Hi ${params.customerName},\n\nYour invoice ${params.invoiceNumber} is ready.\n\nView and pay: ${params.payUrl}\n\nPowered by ArthaPatra`;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [params.recipientEmail],
        subject,
        html,
        text,
      }),
    });
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "sendEmailInvoice: fetch failed");
    return { ok: false, error: "Network error reaching Resend API" };
  }

  if (!response.ok) {
    let errBody: Partial<ResendApiResponseError> = {};
    try {
      errBody = (await response.json()) as Partial<ResendApiResponseError>;
    } catch {
      // ignore parse failure — status code is sufficient
    }
    const errMsg = errBody.message ?? `HTTP ${response.status}`;
    logger.error(
      { err: { status: response.status, name: errBody.name } },
      "sendEmailInvoice: API error",
    );
    return { ok: false, error: errMsg };
  }

  let body: Partial<ResendApiResponseSuccess> = {};
  try {
    body = (await response.json()) as Partial<ResendApiResponseSuccess>;
  } catch {
    logger.error({}, "sendEmailInvoice: failed to parse success response");
    return { ok: false, error: "Unexpected response from Resend API" };
  }

  if (!body.id) {
    logger.error({}, "sendEmailInvoice: no message ID in response");
    return { ok: false, error: "No message ID returned by Resend API" };
  }

  return { ok: true, providerMsgId: body.id };
}
