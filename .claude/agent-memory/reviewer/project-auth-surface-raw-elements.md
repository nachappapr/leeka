---
name: project-auth-surface-raw-elements
description: Auth step components use raw button/input inside custom container divs — established pattern, not a wrapper violation
metadata:
  type: project
---

All auth step components (auth-phone-step, auth-otp-step, auth-profile-step, auth-otp-step) use raw `<button>` and `<input>` elements styled with Tailwind inside custom focus-within container divs.

This is the established auth-surface pattern — reviewed and not flagged in AP-4 and AP-5. `InputField` from `src/components/ui/custom/input-field.tsx` does not support the icon-inside-wrapper layout the auth surface uses. `PillButton` targets a different shape/surface.

**Why:** The auth surface has unique layout (icon + input in a flex container, focus-within ring on the container not the input) that the generic wrappers don't model. The pattern is consistent across all auth step files.

**How to apply:** Do not flag raw button/input in `src/components/auth/auth-*-step.tsx` files as checklist #2 violations. Only flag if a component outside the auth surface uses raw elements when a wrapper exists.
