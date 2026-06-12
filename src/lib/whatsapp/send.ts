import "server-only";

import { serverEnv } from "@/lib/env.server";
import logger from "@/lib/logger";

export interface WhatsAppSendParams {
  /** E.164 recipient phone number, e.g. "+919876543210". */
  recipientPhone: string;
  /** Display invoice number shown in the template body, e.g. "INV-001". */
  invoiceNumber: string;
  /** Absolute pay URL the CTA button navigates to. */
  payUrl: string;
}

export type WhatsAppSendResult = { ok: true; providerMsgId: string } | { ok: false; error: string };

interface WhatsAppApiResponseSuccess {
  messages: Array<{ id: string }>;
}

interface WhatsAppApiResponseError {
  error: { message: string; code: number };
}

/**
 * Builds a WhatsApp Cloud API template message payload and POSTs it to the
 * Meta Graph API. Template is a text/CTA pay-link template (no PDF document
 * header — that is deferred to Epic 8).
 *
 * The template must be pre-approved in WABA with two components:
 *   - body: one variable {{1}} → invoiceNumber
 *   - button (URL type): one variable {{1}} → the pay URL path suffix
 *
 * Template payload follows the Cloud API v21.0 messages schema:
 * https://developers.facebook.com/docs/whatsapp/cloud-api/messages/template-messages
 *
 * Never logs the recipientPhone, accessToken, or pay URL — no PII/secrets in logs.
 */
export async function sendWhatsAppInvoice(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
  const phoneNumberId = serverEnv.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = serverEnv.WHATSAPP_ACCESS_TOKEN;
  const templateName = serverEnv.WHATSAPP_TEMPLATE_NAME;
  const apiVersion = serverEnv.WHATSAPP_API_VERSION ?? "v21.0";

  if (!phoneNumberId || !accessToken || !templateName) {
    return { ok: false, error: "WhatsApp not configured" };
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  /*
   * Template payload shape:
   *
   * The CTA button uses a dynamic URL suffix approach: the template's button
   * base URL is registered in WABA as the app root (e.g. "https://app.arthapatra.in/pay/"),
   * and we supply the token suffix as button variable {{1}}.
   *
   * This requires the template to have:
   *   components[0] = { type: "body", parameters: [{ type: "text", text: invoiceNumber }] }
   *   components[1] = { type: "button", sub_type: "url", index: "0",
   *                     parameters: [{ type: "text", text: <token> }] }
   *
   * We pass the full payUrl as the button variable text. When the WABA template
   * button base URL is set to "/" or the template uses a static URL with a
   * trailing variable, Meta appends this value. If the template uses a fully
   * dynamic URL, pass the full URL here. Both are valid; the frontend knows
   * the template's registered shape.
   *
   * For the body variable we pass the invoice number so the customer sees
   * a message like "Your invoice INV-001 is ready. Tap below to pay."
   */
  const payload = {
    messaging_product: "whatsapp",
    to: params.recipientPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: params.invoiceNumber }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: params.payUrl }],
        },
      ],
    },
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    logger.error({ err: { message: String(err) } }, "sendWhatsAppInvoice: fetch failed");
    return { ok: false, error: "Network error reaching WhatsApp API" };
  }

  if (!response.ok) {
    let errBody: Partial<WhatsAppApiResponseError> = {};
    try {
      errBody = (await response.json()) as Partial<WhatsAppApiResponseError>;
    } catch {
      // ignore parse failure — status code is sufficient
    }
    const errMsg = errBody.error?.message ?? `HTTP ${response.status}`;
    logger.error(
      { err: { status: response.status, code: errBody.error?.code } },
      "sendWhatsAppInvoice: API error",
    );
    return { ok: false, error: errMsg };
  }

  let body: Partial<WhatsAppApiResponseSuccess> = {};
  try {
    body = (await response.json()) as Partial<WhatsAppApiResponseSuccess>;
  } catch {
    logger.error({}, "sendWhatsAppInvoice: failed to parse success response");
    return { ok: false, error: "Unexpected response from WhatsApp API" };
  }

  const msgId = body.messages?.[0]?.id;
  if (!msgId) {
    logger.error({}, "sendWhatsAppInvoice: no message ID in response");
    return { ok: false, error: "No message ID returned by WhatsApp API" };
  }

  return { ok: true, providerMsgId: msgId };
}
