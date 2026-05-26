---
name: project-role-img-vs-meter
description: Decision: role=img is the correct pattern for "share of total" data bars; role=meter/progressbar is wrong for this use case
metadata:
  type: project
---

For AgingBar in MoneyAwaitedCard: the bar represents a bucket's share of total outstanding (e.g. "paid = 52% of all outstanding"). This is NOT a progress-toward-completion indicator.

- `role="progressbar"` / `role="meter"` (APG) implies a deterministic value on a scale toward a goal or a measurable quantity with min/max/now semantics. It would mislead AT users into thinking the bar is tracking progress toward a target.
- `role="img"` with a complete `aria-label` (label + amount + percent) is semantically correct for a purely informational data visualisation.
- The visible label and amount text are redundant text alternatives — `role="img"` with `aria-label` on the track div is the right call.

**Why:** A "share of total" bar has no meaningful "value now / min / max" — the percent IS the label. Forcing meter semantics would require fabricating a max=100 which might imply the bucket should fill to 100%, which is misleading in an aging report.

**How to apply:** When auditing data-vis bars in Lekka, distinguish "progress toward goal" (use meter/progressbar) from "share of whole" (use role=img with aria-label). AgingBar = share-of-whole. Invoice completion status = progress toward goal.
