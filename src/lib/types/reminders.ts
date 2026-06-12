export type ReminderChannel = "whatsapp" | "email";

export interface ReminderSettingsData {
  enabled: boolean;
  offsets: number[];
  channel: ReminderChannel;
}

export type UpdateReminderSettingsResult =
  | { ok: true; data: ReminderSettingsData }
  | { ok: false; error: string };

/**
 * Shape returned by the claim_due_reminders RPC for each claimed reminder.
 * All fields are available without additional queries — the RPC returns
 * everything the cron route needs to dispatch.
 */
export interface ClaimDueReminderItem {
  event_id: string;
  invoice_id: string;
  business_id: string;
  invoice_number: string | null;
  public_token: string;
  customer_phone: string | null;
  customer_email: string | null;
  customer_name: string | null;
  channel: string;
  offset_days: number;
}

/**
 * Top-level shape returned by the claim_due_reminders RPC.
 */
export interface ClaimDueRemindersRow {
  claimed_count: number;
  reminders: ClaimDueReminderItem[];
}
