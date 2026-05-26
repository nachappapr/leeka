<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Design system rules (mandatory for all agents)

### 1. No global CSS without explicit approval

Do NOT add anything to these files without the user explicitly saying so:
- `src/app/globals.css` — app-level base styles, Tailwind tokens, theme variables
- Any `@layer base`, `@layer components`, or `@layer utilities` block

If you think a global class is needed, **stop and ask**. The answer is almost always to inline Tailwind in the component instead.

### 2. Component styles stay in the component — Tailwind only

All styling for a component must live in that component's `className` strings using Tailwind utilities. Do not:
- Extract component-specific styles to `globals.css`
- Add a `.my-component { ... }` rule to globals.css
- Create a `.module.css` or sibling CSS file for a component
- Use a colocated `<style>` block
- Use inline `style={{ ... }}` props (ESLint warns; the only allowed exception is data-driven CSS variables — e.g. `style={{ ['--accent']: tone }}` — with an inline `// eslint-disable-next-line no-restricted-syntax` and a one-line justification)

Arbitrary values are also banned by ESLint: no `bg-[#E8573A]`, no `p-[13px]`, no `text-[15px]`, no `rounded-[6px]`. Use a named token from `src/app/globals.css` or a canonical Tailwind class. If neither covers it, stop and ask.

If a pattern repeats across 3+ unrelated components and has a clear semantic name, ask the user before extracting it.

### 3. Design token discipline

Before adding a new token to `src/app/globals.css` (`@theme` block or CSS variables):
- Check if an existing token already covers it
- Check if a Tailwind canonical class covers it (`px ÷ 4 = Tailwind number`, e.g. 460px → `max-w-115`)
- Only tokens where the **name carries semantic meaning across the entire app** justify a shared token
- Single-use or component-scoped values must be inlined as arbitrary values (`text-[13px]`, `h-[42px]`)
- Never add a token without explicit user approval

### 4. Color token hierarchy (use in this order)

1. **App semantic tokens** (defined in `src/app/globals.css` `@theme`) — use these for all new code
2. **shadcn tokens** (`bg-background`, `text-foreground`, `bg-muted`) — only inside `src/components/ui/` primitives
3. **Raw brand palette** — only when no semantic token fits; ask first
4. **Arbitrary hex** — never (`bg-[#E8573A]` should be banned by ESLint)

### 5. Reuse components from `src/components/ui/`

The shared UI directory is the first place to look, not the last.

- **Before creating any component, search `src/components/ui/` first.** If a match exists, import it — do not re-implement.
- **A new icon ALWAYS goes in `src/components/icons/`** (re-exported from `@/components/icons`) — never inline an SVG in a page/component, never import directly from `lucide-react` outside that folder (ESLint blocks it), and never define an icon ad-hoc in app code. If lucide doesn't have it, add a custom SVG to `src/components/icons/` and re-export. (Copy source SVGs exactly: paths, sizes, stroke values — never approximate.)
- **If a new reusable component appears in app/page code, stop and ask the user** whether it should be promoted to `src/components/ui/`. Don't move it silently, and don't leave a clearly-shared component stranded without flagging it.
- Never edit pristine shadcn primitives in `src/components/ui/` directly — brand variants go in sibling wrappers via `cn()`.

### 6. File organisation — one component per file, mirror under `src/components/<feature>/`

A page in `src/app/<feature>/page.tsx` is for composition only. It MUST NOT define multiple sub-components inline. Pull every sub-component out into its own file under `src/components/<feature>/`, mirroring the route. `src/app/` stays pure routing; all React lives under `src/components/`.

```
src/app/dashboard/
  page.tsx              ← composes; no inline sub-components
  layout.tsx
src/components/
  dashboard/            ← feature folder, mirrors the route
    topbar.tsx          ← one exported component per file
    hero-grid.tsx
    invoices-card.tsx
    filter-chips.tsx
    invoices-table.tsx
  ui/
    primitives/         ← pristine shadcn / Base UI
    custom/             ← brand wrappers + cross-cutting custom components
```

Rules:

- **One exported component per file.** A tiny private helper used by exactly one component in the same file may stay private (not exported); the moment a second file needs it, give it its own file.
- **Filename = kebab-case of the component name.** `InvoicesTable` → `invoices-table.tsx`. No `index.tsx` files for components; the file's name carries the symbol.
- **Feature folder by default.** New components from a page go to `src/components/<feature>/` named after the route. Don't reach for `src/components/ui/custom/` until the component is **obviously cross-cutting** — meaning the name signals app-wide use (Topbar, MobileTabBar, CustomerCell, StatusPill, PillButton). When in doubt, start in the feature folder and ask before promoting.
- **Page composes, page doesn't define.** If `page.tsx` grows a `function ChildName()` block, that block belongs in its own file in the feature folder. The only exceptions are the default-exported page component itself and trivial 3–5 line layout fragments that have no name worth giving.

---

## Agent dispatch (mandatory routing rule)

There is no top-level router agent **by design** — a subagent runs once and returns, so it cannot own the per-unit human-review gate. **The main conversation is the router.** Apply this deterministic rule before delegating any build/feature work; do not improvise routing.

```
Is a design artifact present OR referenced? — ANY of these counts, route on intent not exact phrasing:
  • HTML/CSS pasted, attached, or referenced ("the html below", "this html", "from the html", "use the html")
  • Screenshot, image, or Figma link provided
  • A `.html` filename mentioned (Bahi.html, Invoice App.html, Bahi Breakpoints.html, etc.)
  • Phrasings: "use the below html", "use this html to …", "create/build/make … from this html",
    "convert this html", "turn this html into …", "match this design", "pixel-perfect",
    "design audit", "fix design mismatches", "here's the html for X", "build X from the design"
  └─ YES → design-fidelity-orchestrator → frontend-engineer → reviewer → accessibility-auditor
  └─ NO ↓
Is it a PRD feature build / "start Story N" / "wire live data" / "next section"?
  └─ YES → prd-build-orchestrator (it classifies each unit per the implementer table below)
  └─ NO ↓
Mixed: build from HTML AND wire it to live data?                      → design-fidelity-orchestrator FIRST
                                                                         (static component tree), THEN
                                                                         prd-build-orchestrator / backend-engineer
                                                                         (data) — two sequential passes, never one
Standalone a11y check of an existing component/page?                  → accessibility-auditor (direct)
Standalone non-negotiables review of a diff/branch?                   → reviewer (direct)
Ambiguous which lane?                                                 → ask one routing question, then dispatch
```

**Routing tiebreaker:** if the prompt mentions HTML / a design artifact AT ALL — even alongside words like "create", "build", "make", "add" that sound like a feature build — route to `design-fidelity-orchestrator`. The design lane wins over the PRD lane whenever a design source is present. Never strip the design context and hand a raw "create dashboard page" task to `frontend-engineer` when HTML was provided.

**Implementer routing (inside `prd-build-orchestrator`, and for direct delegation):**

| Unit shape | Implementer |
|---|---|
| UI / component / page / data-**read** layer wired into TypeScript | `frontend-engineer` |
| DB **write path**: migration, RPC, RLS policy, trigger, Edge Function, write-path Server Action / route handler | `backend-engineer` |

**Gates (read-only, never write code):** `reviewer` runs on every implemented unit (semantic non-negotiables). `accessibility-auditor` runs after the reviewer PASSes **only when the unit touches consumer-facing UI** (always-on in the design-fidelity pipeline; conditional in prd-build). Both feed the orchestrator's internal fix loop — a Critical/High from either blocks human review. Lint/tsc are the implementer's own gate; for DB units `backend-engineer`'s Supabase-MCP evidence is the gate (lint/tsc are blind to SQL).

**Orchestrators never write code.** `design-fidelity-orchestrator` and `prd-build-orchestrator` run on Opus and only plan, sequence, delegate, and gate; implementers/gates run on Sonnet. The human-review checkpoint between units is owned by the main conversation, never a subagent.
