"use client"

import { useState } from "react"

import { Card } from "@/components/ui/custom/card"
import { ToggleSwitch } from "@/components/ui/custom/toggle-switch"
import { SETTINGS_NOTIFICATION_TOGGLES } from "@/lib/constants/settings"

export function NotificationsSection() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    () => Object.fromEntries(SETTINGS_NOTIFICATION_TOGGLES.map((t) => [t.id, t.defaultOn])),
  )

  function setToggle(id: string, value: boolean) {
    setToggles((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <Card title="Notifications" headingLevel={3}>
      <div className="p-6">
        {SETTINGS_NOTIFICATION_TOGGLES.map((t) => (
          <ToggleSwitch
            key={t.id}
            id={`notif-toggle-${t.id}`}
            label={t.label}
            checked={toggles[t.id] ?? false}
            onCheckedChange={(v) => setToggle(t.id, v)}
          />
        ))}
      </div>
    </Card>
  )
}
