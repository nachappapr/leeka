---
name: feedback-opacity-on-colour
description: Opacity-reduced white (text-white/90, /85, /80 etc.) always degrades contrast and must not be used for visual hierarchy on coloured backgrounds
metadata:
  type: feedback
---

Do not use opacity modifiers on white text to create visual hierarchy when the text sits on a coloured (non-white/non-black) background.

**Why:** Opacity composites the foreground toward the background colour, dramatically reducing contrast. On coral (#F46A39) even full-opacity white only reaches 2.90:1; /90 drops to 2.62:1 and /85 to 2.52:1 — all below the 4.5:1 small-text AA threshold and even the 3:1 large-text threshold. The designer's intent (de-emphasise the label vs the amount) must be achieved through font-weight, size, or uppercase/tracking — not opacity.

**How to apply:** When reviewing any component that uses text-white/{opacity} on a brand-coloured background (coral, paid-green, overdue-red, etc.), flag it as a High contrast finding immediately. Check the actual composited ratio — it will almost always fail. Recommend removing the opacity modifier and using structural/typographic hierarchy instead.
