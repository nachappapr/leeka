---
name: server-component-live-region-regression
description: Converting a "use client" component with a persistent live region to a Server Component breaks SR announcements — the DOM node is recreated on each navigation, not mutated
metadata:
  type: project
---

Converting a component from `"use client"` with `useState`-based state changes to a Server Component with URL-based (navigation) state changes breaks `role="status"` / `aria-live` regions.

**Why:** AT live regions only fire when the **text content of an existing DOM node changes**. When Next.js App Router re-renders a Server Component after `router.replace()`, the entire subtree is replaced in the DOM — the `role="status"` node is removed and re-inserted. AT sees this as a new element, not a content mutation, and stays silent.

The original `ActivityFeed` was `"use client"` with a persistent `role="status"` div that changed its text content on filter change — correct. The new Server Component version recreates the node on every navigation — broken.

**How to apply:** When migrating a client-side filtered list to URL-based navigation, the live region MUST stay in a persistent Client Component. Options:
1. Keep a thin Client Component shell around the live region that receives the updated count as a prop and changes its inner text.
2. Extract a `<ActivityFeedAnnouncer count={items.length} filter={filter} />` Client Component that lives outside the server-rendered subtree and announces via `useEffect`.
3. SC 4.1.3. No client-boundary cost concern IF the announcer is already a Client Component.

**See also:** [[filter-chips-live-region]]
