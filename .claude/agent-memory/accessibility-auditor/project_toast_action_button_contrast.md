---
name: project_toast_action_button_contrast
description: Toast action button contrast — FIXED (2026-05-29): primary now bg-card/text-coral-ink (12.93:1); ghost now border-card/60 on bg-ink (6.87:1); both pass
metadata:
  type: project
---

FIXED in brand-toast.tsx (verified 2026-05-29).

Primary action: bg-card (#ffffff) + text-coral-ink (#5a1e08) = 12.93:1 — passes SC 1.4.3.

Secondary ghost action: border-card/60 blended on bg-ink (#1f1a14) = 6.87:1 — passes SC 1.4.11 (control boundary 3:1). text-card (#ffffff) on bg-ink = 17.27:1 — passes SC 1.4.3.

Focus ring (both buttons): ring-card/40 blended on bg-ink = 3.82:1 — passes SC 2.4.11 (3:1).

**Prior failure:** bg-primary (#f46a39)/text-card = 3.01:1; bg-card/10 boundary = 1.34:1.

**Why:** bg-card (#ffffff) is the highest-contrast foreground on bg-ink (#1f1a14) = 17.27:1. Swapping to bg-card/text-coral-ink for the primary and border-card/60 for the ghost boundary resolves both failures in one pass.

**How to apply:** On bg-ink toast surfaces: primary action = bg-card text-coral-ink; ghost action = border border-card/60 text-card; focus ring = ring-card/40 (3.82:1). Related: [[project_white_on_coral_badge_contrast]]
