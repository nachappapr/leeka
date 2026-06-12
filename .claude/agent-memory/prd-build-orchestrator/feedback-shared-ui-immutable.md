---
name: feedback-shared-ui-immutable
description: Never modify a shared ui/custom wrapper to serve one feature's needs — create a feature-local variant instead, even if a reviewer prescribed the shared change
type: feedback
---

Do not modify shared `src/components/ui/custom/*` wrappers (API, markup, styling) to satisfy a single feature's requirements — create a feature-local component under `src/components/<feature>/` instead, and only promote to ui/custom with explicit user approval.

**Why:** During Epic 9 AP-23 (2026-06-12) the reviewer's wrapper-over-primitives prescription led to making the shared `Card` polymorphic; the human rejected it at the review gate ("donnot change the card design, if required create another card for the pay upi card") even though it was verified backward-compatible across all 26 consumers. The human treats shared-wrapper visual/API contracts as frozen; a "safe" refactor of one is still a design change requiring approval.

**How to apply:** When a unit needs capabilities a shared wrapper lacks (polymorphic element, extra aria props, variant styling), instruct the implementer to build a feature-local sibling and record the wrapper-over-primitives gap as a user-ratified deviation if flagged. Surface "modify shared wrapper vs feature-local copy" as a question to the human only if feature-local is clearly wrong. See [[project-epic9-pay-link]].
