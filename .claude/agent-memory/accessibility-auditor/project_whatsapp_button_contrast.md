---
name: whatsapp-button-contrast
description: PillButton tone=whatsapp uses bg-whatsapp (#25d366) with text-card (#fff); ratio 1.98:1 — fails SC 1.4.3 badly. Fix: bg-whatsapp-icon (#178040), white text = 5.00:1.
type: project
---

`PillButton` with `tone="whatsapp"` applies `bg-whatsapp` (#25d366) + `text-card` (#ffffff).

Measured ratio: **1.98:1** — fails SC 1.4.3 by a large margin (needs 4.5:1 for normal text at any size).

`bg-whatsapp-press` (#1fae54) with white text = **2.90:1** — still fails.

**Fix:** Change the whatsapp tone in `pill-button.tsx` to use `bg-whatsapp-icon` (#178040) + `text-card`: ratio = **5.00:1** ✓. This is the darkest available whatsapp token and the only one that passes AA.

**Why:** The lighter WhatsApp green (#25d366) was chosen for brand recognition, but it is too light for white text at any body text size.

**How to apply:** Whenever auditing or reviewing a component that uses `tone="whatsapp"`, `bg-whatsapp`, or `text-whatsapp`, check the contrast. The fix is always `bg-whatsapp-icon` for surfaces with white text.
