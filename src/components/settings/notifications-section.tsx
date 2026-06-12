"use client";

import { useEffect, useState, useTransition } from "react";

import { Card } from "@/components/ui/custom/card";
import { ToggleSwitch } from "@/components/ui/custom/toggle-switch";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { SETTINGS_NOTIFICATION_TOGGLES } from "@/lib/constants/settings";
import { getReminderSettings, updateReminderSettings } from "@/app/(app)/settings/actions";
import type { ReminderChannel } from "@/lib/types/reminders";
import { ReminderSettingsPanel } from "./reminder-settings-panel";

const AUTO_REMINDERS_ID = "auto-reminders";

const DEFAULT_OFFSETS = [0, 3, 7];
const DEFAULT_CHANNEL: ReminderChannel = "whatsapp";

const OFFSET_MIN = 0;
const OFFSET_MAX = 60;

function computeOffsetErrors(
  offsets: number[],
  pendingDay: number,
  raw: string,
): Record<number, string> {
  const parsed = parseInt(raw, 10);
  const errors: Record<number, string> = {};

  if (isNaN(parsed)) {
    errors[pendingDay] = "Enter a number between 0 and 60.";
  } else if (parsed < OFFSET_MIN || parsed > OFFSET_MAX) {
    errors[pendingDay] = `Must be between ${OFFSET_MIN} and ${OFFSET_MAX}.`;
  } else if (offsets.includes(parsed) && parsed !== pendingDay) {
    errors[pendingDay] = "You already have a reminder at this offset.";
  }

  return errors;
}

export function NotificationsSection() {
  const [mockToggles, setMockToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      SETTINGS_NOTIFICATION_TOGGLES.filter((t) => t.id !== AUTO_REMINDERS_ID).map((t) => [
        t.id,
        t.defaultOn,
      ]),
    ),
  );

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [offsets, setOffsets] = useState<number[]>(DEFAULT_OFFSETS);
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>(DEFAULT_CHANNEL);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [loadDone, setLoadDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [offsetErrors, setOffsetErrors] = useState<Record<number, string>>({});
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getReminderSettings();
      if (result.ok) {
        setRemindersEnabled(result.data.enabled);
        setOffsets(result.data.offsets);
        setReminderChannel(result.data.channel);
      }
      setLoadDone(true);
    });
  }, []);

  function setMockToggle(id: string, value: boolean) {
    setMockToggles((prev) => ({ ...prev, [id]: value }));
  }

  async function persistReminderSettings(
    enabled: boolean,
    nextOffsets: number[],
    channel: ReminderChannel,
  ) {
    setSettingsError(null);
    setIsSaving(true);
    const result = await updateReminderSettings({ enabled, offsets: nextOffsets, channel });
    setIsSaving(false);

    if (result.ok) {
      setSavedOnce(true);
      setRemindersEnabled(result.data.enabled);
      setOffsets(result.data.offsets);
      setReminderChannel(result.data.channel);
      brandToast.success({ title: "Reminder settings saved" });
    } else {
      if (enabled && result.error === "Auto reminders are a Pro feature") {
        setRemindersEnabled(false);
      }
      setSettingsError(result.error);
    }
  }

  function handleToggleReminders(next: boolean) {
    setRemindersEnabled(next);
    void persistReminderSettings(next, offsets, reminderChannel);
  }

  function handleChannelChange(next: ReminderChannel) {
    setReminderChannel(next);
    void persistReminderSettings(remindersEnabled, offsets, next);
  }

  function handleAddOffset() {
    if (offsets.length >= 6) return;
    for (let d = 0; d <= OFFSET_MAX; d++) {
      if (!offsets.includes(d)) {
        const next = [...offsets, d].sort((a, b) => a - b);
        setOffsets(next);
        void persistReminderSettings(remindersEnabled, next, reminderChannel);
        return;
      }
    }
  }

  function handleRemoveOffset(day: number) {
    if (offsets.length <= 1) return;
    const next = offsets.filter((d) => d !== day);
    setOffsets(next);
    void persistReminderSettings(remindersEnabled, next, reminderChannel);
  }

  function handleOffsetChange(oldDay: number, raw: string) {
    const errors = computeOffsetErrors(offsets, oldDay, raw);
    setOffsetErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const parsed = parseInt(raw, 10);
    const next = offsets.map((d) => (d === oldDay ? parsed : d)).sort((a, b) => a - b);
    setOffsets(next);
  }

  function handleOffsetBlur(oldDay: number, raw: string) {
    const errors = computeOffsetErrors(offsets, oldDay, raw);
    setOffsetErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const parsed = parseInt(raw, 10);
    const next = offsets.map((d) => (d === oldDay ? parsed : d)).sort((a, b) => a - b);
    setOffsets(next);
    void persistReminderSettings(remindersEnabled, next, reminderChannel);
  }

  const saveStatusMessage = isSaving
    ? "Saving reminder settings…"
    : savedOnce
      ? "Reminder settings saved."
      : "";

  const autoRemindersDef = SETTINGS_NOTIFICATION_TOGGLES.find((t) => t.id === AUTO_REMINDERS_ID);

  return (
    <Card title="Notifications" headingLevel={3}>
      <div className="p-6">
        {SETTINGS_NOTIFICATION_TOGGLES.filter((t) => t.id !== AUTO_REMINDERS_ID).map((t) => (
          <ToggleSwitch
            key={t.id}
            id={`notif-toggle-${t.id}`}
            label={t.label}
            checked={mockToggles[t.id] ?? false}
            onCheckedChange={(v) => setMockToggle(t.id, v)}
          />
        ))}

        {autoRemindersDef && (
          <ToggleSwitch
            id={`notif-toggle-${AUTO_REMINDERS_ID}`}
            label={autoRemindersDef.label}
            checked={remindersEnabled}
            onCheckedChange={handleToggleReminders}
          />
        )}

        {settingsError && (
          <p
            id="auto-reminders-error"
            role="alert"
            aria-live="assertive"
            className="mt-2 rounded-md border border-overdue bg-overdue-soft px-3.5 py-2.5 text-caption text-overdue-ink"
          >
            {settingsError}
          </p>
        )}

        {remindersEnabled && loadDone && (
          <ReminderSettingsPanel
            channel={reminderChannel}
            offsets={offsets}
            isSaving={isSaving}
            saveStatusMessage={saveStatusMessage}
            offsetErrors={offsetErrors}
            onChannelChange={handleChannelChange}
            onAddOffset={handleAddOffset}
            onRemoveOffset={handleRemoveOffset}
            onOffsetChange={handleOffsetChange}
            onOffsetBlur={handleOffsetBlur}
          />
        )}
      </div>
    </Card>
  );
}
