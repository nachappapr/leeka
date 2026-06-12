import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import logger from "@/lib/logger";
import { serverEnv, isWhatsAppConfigured, isEmailConfigured } from "@/lib/env.server";
import { sendWhatsAppInvoice } from "@/lib/whatsapp/send";
import { sendEmailInvoice } from "@/lib/email/send";
import type { ClaimDueRemindersRow, ClaimDueReminderItem } from "@/lib/types/reminders";

// AP-30: POST /api/cron/send-reminders — daily auto-reminder dispatch.
// PLATFORM NOTE: Vercel Cron invokes via GET. Both GET and POST are exported
// here and share the same guarded handler (mirrors AP-20 overdue-sweep pattern).

function missingSecret(): Response {
  return Response.json({ ok: false }, { status: 401 });
}

type DispatchOutcome = "sent" | "failed" | "skipped";

interface DispatchResult {
  outcome: DispatchOutcome;
  providerMsgId: string | null;
  error: string | null;
}

async function dispatchReminder(reminder: ClaimDueReminderItem): Promise<DispatchResult> {
  const appBase = serverEnv.NEXT_PUBLIC_APP_URL ?? serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const payUrl = `${appBase}/pay/${reminder.public_token}`;
  const invoiceNumber = reminder.invoice_number ?? reminder.invoice_id;

  if (reminder.channel === "whatsapp") {
    if (!isWhatsAppConfigured()) {
      return { outcome: "skipped", providerMsgId: null, error: "WhatsApp not configured" };
    }

    const phone = reminder.customer_phone;
    if (!phone) {
      return { outcome: "failed", providerMsgId: null, error: "No recipient on file" };
    }

    const result = await sendWhatsAppInvoice({ recipientPhone: phone, invoiceNumber, payUrl });
    if (result.ok) {
      return { outcome: "sent", providerMsgId: result.providerMsgId, error: null };
    }
    return { outcome: "failed", providerMsgId: null, error: result.error };
  }

  if (reminder.channel === "email") {
    if (!isEmailConfigured()) {
      return { outcome: "skipped", providerMsgId: null, error: "Email not configured" };
    }

    const recipientEmail = reminder.customer_email;
    if (!recipientEmail) {
      return { outcome: "failed", providerMsgId: null, error: "No recipient on file" };
    }

    const customerName = reminder.customer_name ?? "Customer";
    const result = await sendEmailInvoice({ recipientEmail, invoiceNumber, payUrl, customerName });
    if (result.ok) {
      return { outcome: "sent", providerMsgId: result.providerMsgId, error: null };
    }
    return { outcome: "failed", providerMsgId: null, error: result.error };
  }

  return { outcome: "skipped", providerMsgId: null, error: `Unknown channel: ${reminder.channel}` };
}

async function runSendReminders(request: Request): Promise<Response> {
  // ── Auth guard: CRON_SECRET bearer token ──────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
    return missingSecret();
  }

  // ── Claim all due reminders atomically via the RPC ────────────────────────
  // The admin client bypasses RLS — required for the background cron context
  // (no auth.uid()). admin.ts is server-only and never reachable from the browser.
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("claim_due_reminders");

  if (error) {
    logger.error(
      { err: { code: error.code, message: error.message } },
      "send-reminders: claim_due_reminders RPC failed",
    );
    return Response.json({ ok: false }, { status: 500 });
  }

  const row = data as unknown as ClaimDueRemindersRow;
  const claimed = row.claimed_count;
  const reminders = row.reminders;

  if (claimed === 0) {
    logger.info({ claimed: 0 }, "send-reminders: no reminders due today");
    return Response.json({ ok: true, claimed: 0, sent: 0, failed: 0, skipped: 0 });
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const reminder of reminders) {
    let dispatchResult: DispatchResult;

    try {
      dispatchResult = await dispatchReminder(reminder);
    } catch (err) {
      logger.error(
        { err: { message: String(err) }, invoiceId: reminder.invoice_id },
        "send-reminders: dispatch threw unexpectedly",
      );
      dispatchResult = { outcome: "failed", providerMsgId: null, error: String(err) };
    }

    const { outcome, providerMsgId, error: dispatchError } = dispatchResult;

    if (outcome === "sent") sent++;
    else if (outcome === "failed") failed++;
    else skipped++;

    // Write one message_log row per dispatch attempt.
    // The invoice_events row was already inserted by claim_due_reminders — do not insert again.
    const { error: logErr } = await admin.from("message_log").insert({
      business_id: reminder.business_id,
      invoice_id: reminder.invoice_id,
      channel: reminder.channel,
      status: outcome,
      provider_msg_id: providerMsgId,
      error: dispatchError,
    });

    if (logErr) {
      logger.error(
        { err: { code: logErr.code }, invoiceId: reminder.invoice_id },
        "send-reminders: message_log insert failed",
      );
    }
  }

  logger.info({ claimed, sent, failed, skipped }, "send-reminders: completed");

  return Response.json({ ok: true, claimed, sent, failed, skipped });
}

export async function POST(request: Request): Promise<Response> {
  return runSendReminders(request);
}

// Vercel Cron fires HTTP GET. This handler runs the identical guarded logic.
export async function GET(request: Request): Promise<Response> {
  return runSendReminders(request);
}
