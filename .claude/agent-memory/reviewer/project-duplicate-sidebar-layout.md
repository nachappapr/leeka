---
name: project-duplicate-sidebar-layout
description: Each sidebar route duplicates SidebarProvider + AppSidebar + SidebarInset layout instead of using a route group
metadata:
  type: project
---

`/dashboard` and `/invoices` both define identical `layout.tsx` files: `SidebarProvider (cookies) + AppSidebar + SidebarInset`. As routes multiply, this will be copy-pasted for every new sidebar-scoped route.

**Why:** No `(app)` route group layout exists. The root layout (`src/app/layout.tsx`) only handles fonts/html/body. Sidebar layout should live in a route group such as `src/app/(app)/layout.tsx` that wraps all sidebar-bearing routes.

**How to apply:** Flag every new sidebar route that duplicates the layout as Medium #13 (convention violation / maintenance liability). Fix direction: create `src/app/(app)/layout.tsx` with the shared SidebarProvider shell; move `/dashboard` and `/invoices` inside `(app)/`; delete the per-route layout files.
