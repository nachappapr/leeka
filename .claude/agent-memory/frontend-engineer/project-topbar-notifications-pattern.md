---
name: project-topbar-notifications-pattern
description: AP-32 topbar notifications wiring pattern — async SC + client bridge, notificationsSlot prop, settings-container constraint
type: project
---

**Decision: Topbar notifications architecture (AP-32)**

`Topbar` is kept as a synchronous Server Component to preserve compatibility with `settings-container.tsx` ("use client"). Notifications are injected via a `notificationsSlot?: React.ReactNode` prop.

The notification fetch chain:
1. `src/lib/data/notifications.ts` — server-only data layer (`import "server-only"`)
2. `src/components/ui/custom/topbar-notifications.tsx` — async Server Component; fetches `getNotificationGroups()` and renders `TopbarNotificationsClient`
3. `src/components/ui/custom/topbar-notifications-client.tsx` — "use client" bridge; owns poll (60s `router.refresh()` via `useEffect`), mark-all-read via `useTransition` + `markAllNotificationsRead()` action, panelOpen state to pause poll while panel is open

**Why:** `settings-container.tsx` is `"use client"` and imports `Topbar` directly. Making `Topbar` async would break the client import chain. A separate async server component avoids this while still fetching real data for all server-component containers.

**How to apply:** For any future notifications wiring or similar server-data slots in Topbar: keep Topbar sync, pass via `notificationsSlot`. All fenced containers (`src/components/invoices/*`, `src/components/settings/*`) do NOT receive the slot — they render no bell. This is a known deviation.

**Polling pattern:** `useEffect` interval every 60s, skips on `document.hidden || panelOpen`. `router.refresh()` re-runs server data fetches. Panel open state tracked via `onOpenChange` prop added to `NotificationPanel`.

**NotificationPanel controlled mode:** Added optional `open` + `onOpenChange` props (semi-controlled: `open = controlledOpen ?? internalOpen`). This is a minimal generic change that doesn't break uncontrolled usages.
