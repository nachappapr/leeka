---
name: project-calendar-today-classnames-override
description: BrandDatePicker overrides classNames.today = 'text-primary font-bold'; this drops bg-muted from primitive and leaves text-primary (#f46a39) on bg-background = 2.80:1; fails SC 1.4.3
metadata:
  type: project
---

In `src/components/ui/custom/brand-date-picker.tsx`, the consumer passes `classNames={{ today: "text-primary font-bold", ... }}`. In react-day-picker v10, consumer `classNames` are spread LAST in the primitive and completely REPLACE the primitive's `today` class (which included `bg-muted text-foreground`). The result: today's cell gets no background, and `text-primary` (#f46a39) renders on `bg-background` (#fbf6ef) = **2.80:1** — fails SC 1.4.3 (needs 4.5:1 for 14px font).

**Why:** react-day-picker v10 `classNames` is a wholesale replacement per key, not a merge. Implementers think they are adding to the primitive's today class but are actually replacing it.

**How to apply:** Change the `today` override to include a background: e.g. `"bg-surface-2 text-coral-ink font-bold"` (coral-ink #5a1e08 on surface-2 #f5efe6 = 12.03:1) or use `text-foreground bg-muted font-bold` to preserve the original background. Never use `text-primary` without a complementary background change.

Related: [[project-coral-text-on-surfaces]]
