---
name: project-dashboard-patterns
description: Dashboard page implementation patterns and ESLint rules confirmed during the first dashboard build
type: project
---

**Decision: Dashboard architecture**
- `src/app/dashboard/layout.tsx` — Server Component shell, imports `<Sidebar />` Client Component
- `src/components/ui/custom/sidebar.tsx` — "use client", uses `usePathname()` for active state
- `src/app/dashboard/page.tsx` — Server Component, all sub-components in same file as named functions

**Why:** Next.js 16 App Router pattern: layout wraps server-rendered shell, Client Component boundary isolated to sidebar only.

**How to apply:** Keep dashboard sub-components (Topbar, HeroGrid, InvoicesCard, etc.) as server functions in the same page file. Only push "use client" down to components that need browser APIs / state.

---

**ESLint confirmed behaviors:**
- `src/components/ui/**` is EXEMPT from the no-arbitrary-values rule — sidebar, pill-button etc. can use `text-[13px]` etc.
- `src/app/**` is NOT exempt — must use named tokens only
- `backdrop-blur` is deprecated — use `backdrop-blur-sm` (confirmed by linter)
- `BarChart2` icon needed only in sidebar (nav array), not in page.tsx — remove from page imports if not used in page JSX
- `hover:bg-coral/5` is valid (named opacity step) — replaces `hover:bg-coral/[0.04]`

---

**Token mappings confirmed:**
- `text-[11px]` → `text-xs` (12px)
- `tracking-[0.5px]` → `tracking-wide`
- `tracking-[0.6px]` → `tracking-wider`
- `text-[13px]` → `text-sm` (14px)
- `w-[76px]` → `w-20` (80px)
- `rounded-[10px]` → `rounded-lg`
- `bg-black/18` → `bg-black/20`
- `backdrop-blur` → `backdrop-blur-sm`

---

**JSX depth limit (6 levels):** Extract `CustomerCell` and `ActivityItem` as separate named functions to avoid exceeding depth 6 inside TableRow or activity list items.

**shadcn table path:** `src/components/ui/primitives/table.tsx` (matches project alias `@/components/ui/primitives`)
