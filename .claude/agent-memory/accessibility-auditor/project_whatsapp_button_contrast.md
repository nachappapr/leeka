---
name: whatsapp-button-contrast
description: PillButton tone=whatsapp — bg-whatsapp now #008069 after token update 2026-05-30; white text = 4.86:1; PASSES SC 1.4.3; prior deviation RESOLVED.
type: project
---

`PillButton` with `tone="whatsapp"` applies `bg-whatsapp` + `text-card` (#ffffff).

**Token history:**
- Before 2026-05-30: `--color-whatsapp` = #25d366 → 1.98:1 vs white → FAILS SC 1.4.3. Accepted deviation.
- After 2026-05-30: `--color-whatsapp` = #008069 → **4.86:1** vs white → PASSES SC 1.4.3 (threshold 4.5:1 for 14px bold normal text).

`bg-whatsapp-press` (#006653) on white panel surface = **6.94:1** → PASSES SC 1.4.11 (≥3:1 non-text).
`bg-whatsapp-icon` (#178040) on white surface = **5.00:1** → still available as fallback if needed.

**Status (2026-05-30): DEVIATION RESOLVED.** Token update from #25d366 → #008069 brings both rest state and hover state into AA compliance. No longer an accepted deviation — treat as passing in future audits.

**Why:** Token updated to WhatsApp's official darker green (#008069), which satisfies both brand recognition and WCAG AA contrast.

**How to apply:** Report as PASS for SC 1.4.3 in future audits. The notification-rail dot uses `bg-whatsapp-press` (#006653) which is decorative (aria-hidden) but still passes SC 1.4.11 at 6.94:1 on white.
