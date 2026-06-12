---
name: project-concurrent-lane-scope-bleed
description: Concurrent prd-build lanes (AP-38/AP-39) bleed into each other's working-tree diff; reviewer sees both units in one git diff
metadata:
  type: project
---

When two AP units run in parallel lanes (e.g. AP-38 invoice template + AP-39 notification settings), both land in the same working tree before either is committed. The reviewer diff therefore contains out-of-scope files from the sibling unit.

**Why:** prd-build-orchestrator runs concurrent lanes in the same worktree; each unit's scope fence is per-unit, but git diff is repo-wide.

**How to apply:** When the review task supplies an explicit scope fence and the diff includes files from that fence, flag them as Medium #13 (scope creep). Do NOT treat sibling-lane additions as new non-negotiable violations — assess their code quality only if asked to review that unit separately. PASS the AP-38 surfaces on their own merits; call out the bleed as Medium so the commit is isolated correctly before merging.
