---
name: project-eslint-disable-img-element
description: eslint-disable for @next/next/no-img-element is not a sanctioned exception — use next/image with unoptimized or a custom loader instead
metadata:
  type: project
---

AGENTS.md allows exactly one `eslint-disable` exception: `no-restricted-syntax` for the CSS-variable data-driven case. All other `eslint-disable` comments are High code-quality violations, including `@next/next/no-img-element`.

The justification "signed URL / blob: URL; domain is dynamic and not configurable as a Next.js remotePattern" does not hold — `next/image` supports `unoptimized` prop for dynamic/blob URLs, or a custom loader can be used. Neither requires disabling the lint rule.

**Why:** AGENTS.md is explicit: "no eslint-disable comments of any form" with one standing exception. A custom justification comment does not create a new exception category.

**How to apply:** Any `eslint-disable @next/next/no-img-element` in feature code is High. The fix direction is `<Image unoptimized ... />` from `next/image` when the URL is dynamic/signed, removing the disable comment entirely.
