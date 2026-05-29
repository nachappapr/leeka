---
name: project_whatsapp_textarea_focus_indicator
description: WhatsApp textarea border/ring — FIXED (2026-05-29): border-whatsapp-icon (5.00:1) + focus-visible:ring-whatsapp-icon (5.00:1); both pass 1.4.11/2.4.11
metadata:
  type: project
---

FIXED in send-channels-modal.tsx NoteField (verified 2026-05-29).

Resting border: border-whatsapp-icon (#178040) on bg-card (#ffffff) = 5.00:1 — passes SC 1.4.11 (3:1).
Resting glow: ring-3 ring-whatsapp/15 — blended (#def8e8) on bg-card = 1.12:1. This is purely decorative shadow/glow, not the control boundary indicator — the boundary is the solid border. Acceptable.
Focus-visible ring: focus-visible:ring-3 ring-whatsapp-icon (solid #178040) = 5.00:1 vs bg-card — passes SC 2.4.7 / 2.4.11. Perceptible change: bright-green transparent glow → solid dark-green ring.

**Prior failure:** border-whatsapp (#25d366) = 1.98:1 on bg-card; ring/15→/30 change = 1.11:1 (invisible focus indicator).

**Why:** whatsapp-icon (#178040) at 5.00:1 is the correct anchor for any whatsapp-themed border or ring on bg-card. Light whatsapp green (#25d366) is purely for decorative fills/glows, never boundaries.

**How to apply:** On bg-card whatsapp-themed fields: border-whatsapp-icon (resting + focus); ring-whatsapp/15 decorative glow only; focus-visible:ring-whatsapp-icon (solid). Never use ring-whatsapp alone as the focus indicator.
