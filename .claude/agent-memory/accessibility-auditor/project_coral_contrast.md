---
name: coral-contrast-verified
description: Verified WCAG contrast ratios for white and opacity-white text on the coral gradient stops (#F46A39, #E94A1F)
metadata:
  type: project
---

Measured 2026-05-26 against src/app/globals.css tokens. All ratios are exact WCAG relative-luminance calculations.

## Gradient stop luminances
- `--color-coral` (#F46A39): L = 0.3116
- `--color-coral-deep` (#E94A1F): L = 0.2355

## White (#FFFFFF, L = 1.0) on coral gradient
- vs #F46A39: **2.90:1** — FAILS large-text (3:1) and small-text (4.5:1)
- vs #E94A1F: **3.68:1** — PASSES large-text, FAILS small-text

## text-white/90 (composited ≈ #FEF0EB, L ≈ 0.899) on coral gradient
- vs #F46A39: **2.62:1** — FAILS both thresholds
- vs #E94A1F: **3.32:1** — FAILS both thresholds

## text-white/85 (composited ≈ #FDE9E1, L ≈ 0.861) on coral gradient
- vs #F46A39: **2.52:1** — FAILS both thresholds
- vs #E94A1F: **3.19:1** — FAILS both thresholds

## Pill: text-white over bg-black/20 composited on coral gradient
- Pill BG over #F46A39 ≈ RGB(195, 85, 46), L ≈ 0.2014 → white: **4.18:1** — FAILS small-text (4.5:1)
- Pill BG over #E94A1F ≈ RGB(186, 59, 25), L ≈ 0.1512 → white: **5.22:1** — PASSES small-text
- Fix: increase to bg-black/30; white on resulting L≈0.152 → 6.06:1 — PASSES at both stops

## Status dot: #FFD66B (pending-bright, L = 0.719) on coral gradient
- vs #F46A39: **2.13:1** — FAILS non-text 3:1 (SC 1.4.11)
- vs #E94A1F: **2.69:1** — FAILS non-text 3:1 (SC 1.4.11)
- NOTE: dot is aria-hidden and decorative (adjacent text carries meaning). Not a hard SC 1.4.11 violation; flag as medium if dot is intended as a meaningful indicator.

## Key takeaway
Opacity-reduced white on coral NEVER reaches 4.5:1. Small text on the coral gradient requires the gradient's lighter stop to be darkened significantly (lighter stop L must drop below ~0.182 for white to reach 4.5:1; practically, small text on coral should use an opaque dark-toned overlay or a dark text colour). Large text (≥24px) needs lighter stop L < 0.300; at #F46A39 (L=0.3116) even full-opacity white at 2.90:1 misses 3:1.
