---
name: coral-white-text-on-bg
description: White text on bg-coral (#f46a39) = 3.01:1. Passes large text (>=18.67px bold) barely, fails normal text (needs 4.5:1). Use text-ink (#1f1a14) on coral for small text. Avatar initials and Total Due strip both affected.
type: project
---

`text-card` (#ffffff) on `bg-coral` (#f46a39) = **3.01:1**.

- Passes 3:1 for large text ONLY (>=18.67px bold OR >=24px normal). Even then, barely — by 0.01 margin, so consider it fragile.
- Fails 4.5:1 for normal text (text-11, text-12, text-body/16px, text-title-sm/18px — all below the large-text threshold).

**Affected surfaces:**
- Avatar initials (`text-body` = 16px extrabold on `bg-coral`) → FAILS
- Total Due strip kicker label (`text-11` on `bg-coral`) → FAILS
- Total Due amount (`text-20` extrabold on `bg-coral`) → passes large-text 3:1 by 0.01

**Fix for small text on coral bg:** Use `text-ink` (#1f1a14) on `bg-coral` = **5.73:1** ✓. This is the only token that reliably passes 4.5:1 on coral.

**Fix for invoice ID coral-on-white at 18px:** `text-coral` (#f46a39) on `bg-card` (#ffffff) = 3.01:1. At 18px extrabold (< 18.67px threshold), this is normal text → needs 4.5:1 → FAILS. Use `text-coral-ink` (#5a1e08) for ID numbers displayed at <19px, or bump size to `text-20` (20px extrabold = large text → 3:1 passes).

**How to apply:** Any time `text-card` or `text-white` is used on a coral background, check the font size. If < 18.67px bold (or < 24px normal), it fails. Always use `text-ink` on coral for small/body text.
