---
name: dark-swatch-ring-contrast
description: border-ink (#1f1a14) selected-state ring on the Dark/Ink swatch (#1f1a14) = 1:1 — ring is invisible; white Check icon (17.27:1) is the only selection indicator for that swatch
metadata:
  type: project
---

In `accent-swatch.tsx`, the selected state uses `border-ink` as a ring. For all swatches except Dark/Ink (#1f1a14), border-ink contrasts adequately (3.14:1–5.73:1). For the Dark/Ink swatch, border-ink IS the same colour as the swatch background → 1:1 contrast, ring is completely invisible.

The white Check icon (17.27:1) is also present when selected, so SC 1.4.1 (non-colour indication) is satisfied. However SC 1.4.11 requires the UI component boundary to have 3:1 contrast with adjacent colours. The selection ring is a component boundary and it fails completely on this one accent.

**Why:** SC 1.4.11 is about the visual change indicating state — even if the Check icon saves SC 1.4.1, the ring itself is still a UI component graphic that must contrast 3:1.

**How to apply:** Flag as HIGH (SC 1.4.11). Fix: change the selected ring to `ring-2 ring-offset-2 ring-white/80` style approach, or use `border-white` when the swatch is the dark ink colour. Since the swatch value is already in a CSS var `--swatch`, the simplest static approach is to use both `border-ink` AND a white ring-offset: `ring-2 ring-white ring-offset-0` will always be visible against any swatch colour. Already a Client Component, pure CSS fix.
