import { SettingsSkeleton } from "@/components/settings/settings-skeleton";

export default function SettingsLoading() {
  return (
    <div role="status" aria-label="Loading settings" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <SettingsSkeleton />
    </div>
  );
}
