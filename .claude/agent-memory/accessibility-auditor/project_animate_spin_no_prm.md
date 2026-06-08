---
name: animate-spin-no-prm
description: Tailwind animate-spin (Loader2 spinner) has no prefers-reduced-motion guard — Medium SC 2.3.3 finding; fix is motion-reduce:animate-none; distinct from the tw-animate-css finding
metadata:
  type: project
---

`className="animate-spin"` (Tailwind's built-in) plays continuously regardless of `prefers-reduced-motion`. Unlike `tw-animate-css` animate-in/fade/zoom, Tailwind does NOT add a `prefers-reduced-motion` guard to `animate-spin` in its preflight.

**Why:** SC 2.3.3 (AAA) and general best practice; Bahi's budget-Android user base includes users who have enabled reduced motion for vestibular or seizure reasons. The spinner is non-essential (state is also communicated by aria-busy + role=status).

**How to apply:** On any `className="animate-spin"`, add `motion-reduce:animate-none` (or `motion-reduce:hidden`). Pure CSS fix, no client-boundary cost. File: `invoice-form-save-draft-button.tsx:77` is the first instance in this flow. Check all other Loader2 usages across the codebase. Related: [[tw-animate-css-no-reduced-motion]].
