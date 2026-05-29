---
name: project-calendar-day-focus-ring
description: CalendarDayButton focus ring uses ring-ring/50 = 1.68:1 on bg-background; fails SC 2.4.11; fix ring-coral-press in calendar.tsx primitive
metadata:
  type: project
---

CalendarDayButton in `src/components/ui/primitives/calendar.tsx` uses `group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50`. The `ring-ring` token = `#f46a39` (coral) at 50% alpha, which composites to approximately `#f8b094` on `bg-background (#fbf6ef)` = 1.68:1. Fails WCAG SC 2.4.11 (3:1 minimum for focus indicators).

**Why:** The Button primitive's base focus ring (focus-visible:ring-ring/50) is a known recurring failure in this project. The Calendar primitive inherits the same ring token via its DayButton usage.

**How to apply:** Replace `group-data-[focused=true]/day:ring-ring/50` with `group-data-[focused=true]/day:ring-coral-press` in `calendar.tsx` line 212. Pure CSS fix, no client boundary impact (calendar.tsx is already 'use client').

Related: [[project-bare-button-focus-ring]], [[project-input-textarea-focus-ring]]
