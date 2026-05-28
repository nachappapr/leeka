---
name: project-globals-css-animation
description: Implementers add @keyframes and @layer utilities to globals.css for feature-specific animations without explicit approval
metadata:
  type: project
---

In N1 (home build), the implementer added `@keyframes float-y` and `.animate-float-y` / `.animate-float-y-reverse` utility classes to `globals.css`. These are home-page-specific animations, not app-wide tokens.

**Why:** AGENTS.md rule 1 prohibits any addition to `globals.css` without explicit user approval. Animations that are used only on one surface are not a shared semantic concern — they should either be inlined as arbitrary Tailwind classes via `tw-animate-css` patterns or extracted into a colocated CSS module if unavoidable.

**How to apply:** Flag any new `@keyframes`, `@layer utilities`, or `@layer components` entries in `globals.css` that were not called out as explicitly approved in the unit's plan or handoff notes. Fix direction: if the animation is surface-specific, explore using Tailwind's `animate-*` with a custom keyframe defined via the `@theme` block OR keep it in `globals.css` only after user explicitly approves it. Severity: High #12.
