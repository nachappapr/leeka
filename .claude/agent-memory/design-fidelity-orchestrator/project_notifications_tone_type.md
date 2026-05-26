---
name: project-notifications-tone-type
description: NotificationTone union is duplicated locally in NotificationIcon (Unit 4) and NotificationRail (Unit 5); Unit 13 must unify it into src/lib/types/notifications.ts and refactor both consumers.
metadata:
  type: project
---

During the notification-panel build (Bahi _standalone_ v2.html), Units 4 (`NotificationIcon`) and 5 (`NotificationRail`) each declare a LOCAL non-exported union:

```ts
type NotificationTone = "paid" | "pending" | "overdue" | "info" | "whatsapp";
```

Unit 13 lands `src/lib/types/notifications.ts` (per the original plan) — when that packet is written, it MUST include a one-line refactor instruction for both `src/components/ui/custom/notification-icon.tsx` and `src/components/ui/custom/notification-rail.tsx`:

> Remove local `NotificationTone` union and replace with `import type { NotificationTone } from "@/lib/types/notifications"`.

**Why:** Unit 3–6 are pure leaves; hoisting a types file when only one consumer exists stranded the file and added scope. Defer to Unit 13 when the broader data layer is being built and the type has 3+ consumers.

**How to apply:** When drafting the Unit 13 handoff packet (notifications types file), explicitly list the two refactor sites above as part of the unit's FILES and ACCEPTANCE. Do not let Unit 13 ship without consolidating these duplicates — otherwise the duplication becomes permanent drift.
