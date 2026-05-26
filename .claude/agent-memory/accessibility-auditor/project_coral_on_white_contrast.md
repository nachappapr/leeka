---
name: coral-on-white-contrast
description: text-coral (#f46a39) on bg-card (#ffffff) fails 4.5:1 at 3.01:1; same token fails on bg-background (#fbf6ef) at 2.80:1
metadata:
  type: project
---

`text-coral` (#f46a39) on `bg-card` (#ffffff) = **3.01:1** — FAILS SC 1.4.3 for normal text (≥14px bold and below).
`text-coral` (#f46a39) on `bg-background` (#fbf6ef, cream) = **2.80:1** — also fails.

`text-coral-press` (#d9531f) on `bg-card` should be checked whenever a fix is prescribed — it is darker and may pass.

**Why:** The "View all" button in the Card header (`src/app/dashboard/page.tsx:142`) uses `text-coral` on a white card background. This is a High severity SC 1.4.3 violation. Any interactive control or text using `text-coral` directly on card/background surfaces will fail.

**How to apply:** Always flag `text-coral` on `bg-card` or `bg-background` for normal text. Check if `text-coral-press` (#d9531f) is the intended accessible alternative; compute that ratio before recommending it as the fix. See [[coral-contrast]] for gradient-background ratios.
