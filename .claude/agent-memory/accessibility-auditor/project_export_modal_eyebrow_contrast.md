---
name: export-modal-eyebrow-contrast
description: Eyebrow pill text-primary on bg-coral-soft fails 4.5:1 (2.54:1); fix is text-coral-ink
metadata:
  type: project
---

`text-primary` (#f46a39) on `bg-coral-soft` (#ffe7da) = **2.54:1** — fails SC 1.4.3 for 11px kicker text (normal threshold 4.5:1).

**Why:** The coral primary colour and coral-soft background are too close in luminance to satisfy body/small text contrast. This pattern appears in eyebrow/badge pills.

**How to apply:** Always use `text-coral-ink` (#5a1e08 = 10.90:1) or `text-ink` (#1f1a14 = 14.55:1) for small text on `bg-coral-soft`. Never `text-primary` or `text-coral` on coral-soft for text smaller than 18.67px bold.
