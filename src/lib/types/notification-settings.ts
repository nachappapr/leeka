/** Persisted state for the four notification channel toggles (AP-39). */
export interface NotificationSettingsData {
  waReceipts: boolean;
  pushViewed: boolean;
  pushPaid: boolean;
  dailyEmail: boolean;
}

export type GetNotificationSettingsResult =
  | { ok: true; data: NotificationSettingsData }
  | { ok: false; error: string };

export type UpdateNotificationSettingsResult =
  | { ok: true; data: NotificationSettingsData }
  | { ok: false; error: string };
