---
name: ring-inset-occlusion
description: focus-visible:ring-inset draws the focus ring inside the element boundary, risking occlusion by button content; prefer exterior ring for tall content-rich buttons
type: project
---

Tailwind `focus-visible:ring-inset` renders the focus ring on the interior face of the element border. For content-rich buttons (those with icon tiles, multi-line labels, badges) the ring overlaps content and can be hidden behind children. This is a SC 2.4.11 risk because the indicator may not be entirely visible.

`ring-coral-press` (#d9531f) inset on `bg-card` (#ffffff) = 4.03:1 — passes the 3:1 floor for focus indicators. But the occlusion concern is separate from contrast: even a high-contrast ring is a failing indicator if it is hidden behind content.

**Fix:** Remove `ring-inset` from tall content-rich buttons. The exterior ring is never occluded by content. Keep `ring-inset` only on small contained controls (icon buttons, inputs) where there is no content to occlude it and the inset position is intentional.

**How to apply:** When `ring-inset` appears on a button taller than ~40px with visible icon/label/badge content, flag High and prescribe removing `ring-inset`.
