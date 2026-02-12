---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [vite, tailwind-v4, tanstack-router, shadcn-ui, typescript-strict, zustand, ky]

# Dependency graph
requires: []
provides:
  - "Vite 6 + React 18 project scaffold on redesign/admin-portal branch"
  - "Tailwind v4 CSS-first config with STREET brand theme tokens"
  - "TanStack Router plugin with auto-generated route tree"
  - "shadcn/ui v4 with 20 core components"
  - "TypeScript strict mode enabled"
  - "Feature-first directory structure (src/features/*)"
affects: [01-02, 01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added: ["@tanstack/react-router", "@tanstack/router-plugin", "zustand", "ky", "tailwindcss@4", "@tailwindcss/vite", "@vitejs/plugin-react-swc@4", "tw-animate-css", "vite@6"]
  removed: ["react-router-dom", "tailwindcss@3", "postcss", "autoprefixer", "tailwindcss-animate", "lovable-tagger", "@tailwindcss/typography", "embla-carousel-react", "input-otp", "react-resizable-panels", "vaul", "recharts", "react-day-picker", "all individual @radix-ui/* packages"]
  patterns: ["Tailwind v4 CSS-first @theme inline", "Feature-first src/features/{domain}/ structure", "TanStack Router file-based routing via plugin"]

key-files:
  created:
    - "src/app/routes/__root.tsx"
    - "src/routeTree.gen.ts"
    - "src/components/ui/*.tsx (20 components)"
    - "src/features/*/  (8 feature domains)"
    - "src/hooks/use-mobile.ts"
  modified:
    - "package.json"
    - "vite.config.ts"
    - "tsconfig.json"
    - "tsconfig.app.json"
    - "src/index.css"
    - "src/main.tsx"
    - "components.json"
    - ".env.example"

key-decisions:
  - "@vitejs/plugin-react-swc bumped to v4 for Vite 6 compatibility"
  - "Removed bun.lockb to unblock shadcn CLI (was detecting bun as package manager)"
  - "Added __root.tsx for TanStack Router to generate route tree cleanly"

patterns-established:
  - "Feature-first: src/features/{domain}/{components,api,hooks,context}"
  - "Shared UI: src/components/ui/ (shadcn), src/components/shared/ (custom)"
  - "CSS-first Tailwind: @theme inline in index.css, no tailwind.config.ts"

# Metrics
duration: 6min
completed: 2026-02-09
---

# Phase 1 Plan 1: Project Scaffold Summary

**Vite 6 + Tailwind v4 + TanStack Router scaffold on redesign/admin-portal branch with TypeScript strict, 20 shadcn/ui components, and feature-first directory structure**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-09T18:55:29Z
- **Completed:** 2026-02-09T19:01:45Z
- **Tasks:** 2/2
- **Files modified:** 152 (122 in task 1, 30 in task 2)

## Accomplishments
- Created `redesign/admin-portal` branch and removed all Lovable-generated source code
- Scaffolded feature-first directory structure with 8 feature domains (auth, users, retailers, couriers, orders, notes, referrals, settings)
- Configured Vite 6 with TanStack Router plugin (auto-generates routeTree.gen.ts) and Tailwind v4 CSS-first plugin
- Enabled TypeScript strict mode with noUnusedLocals/noUnusedParameters
- Migrated Tailwind v3 to v4 CSS-first config preserving all STREET brand colors (light + dark mode)
- Installed 20 shadcn/ui components needed for Phase 1
- Clean `npm run build` and `tsc --noEmit` with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create branch and clean project scaffold** - `b94a8f0` (chore)
2. **Task 2: Configure Tailwind v4, shadcn/ui, and minimal entry point** - `d44c14a` (feat)

## Files Created/Modified
- `package.json` - Updated deps: added TanStack Router, Zustand, ky, Tailwind v4; removed react-router-dom, Tailwind v3, radix-ui
- `vite.config.ts` - Vite 6 with TanStackRouterVite, @tailwindcss/vite, react-swc plugins
- `tsconfig.app.json` - strict: true, noUnusedLocals: true, noUnusedParameters: true
- `tsconfig.json` - Cleaned up, removed loose settings
- `src/index.css` - Tailwind v4 @import + @theme inline with STREET HSL tokens
- `src/main.tsx` - Minimal React 18 placeholder entry point
- `components.json` - Updated for shadcn/ui new-york style + Tailwind v4
- `.env.example` - Added VITE_DEV_BYPASS_AUTH documentation
- `src/app/routes/__root.tsx` - TanStack Router root route
- `src/routeTree.gen.ts` - Auto-generated route tree
- `src/components/ui/*.tsx` - 20 shadcn/ui components (button, card, sidebar, tabs, form, etc.)
- `src/hooks/use-mobile.ts` - Mobile detection hook (from shadcn sidebar)
- `src/features/*/` - 8 feature domain directories with .gitkeep files

## Decisions Made
- Bumped @vitejs/plugin-react-swc from v3 to v4 for Vite 6 peer dependency compatibility
- Removed bun.lockb that was causing shadcn CLI to attempt using bun (not installed)
- Created __root.tsx immediately to ensure TanStack Router plugin generates routeTree.gen.ts without errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @vitejs/plugin-react-swc v3 incompatible with Vite 6**
- **Found during:** Task 1 (npm install)
- **Issue:** plugin-react-swc@3.7.x has peer dependency on Vite 4-5, causing npm peer dep errors with Vite 6
- **Fix:** Bumped to ^4.2.0 which supports Vite 6
- **Files modified:** package.json
- **Verification:** npm ls shows no peer dep issues
- **Committed in:** b94a8f0

**2. [Rule 3 - Blocking] bun.lockb causing shadcn CLI to use bun**
- **Found during:** Task 2 (shadcn add)
- **Issue:** Stale bun.lockb in repo made shadcn detect bun as package manager, but bun is not installed
- **Fix:** Removed bun.lockb so shadcn falls back to npm
- **Files modified:** bun.lockb (deleted)
- **Verification:** shadcn add commands succeed with npm
- **Committed in:** d44c14a

**3. [Rule 3 - Blocking] TanStack Router requires __root.tsx for route generation**
- **Found during:** Task 2 (npm run build)
- **Issue:** Build emitted error: "rootRouteNode must not be undefined. Make sure you've added __root.tsx"
- **Fix:** Created src/app/routes/__root.tsx with minimal root route
- **Files modified:** src/app/routes/__root.tsx
- **Verification:** Build succeeds cleanly, routeTree.gen.ts generated
- **Committed in:** d44c14a

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All fixes necessary to unblock npm install, shadcn CLI, and build. No scope creep.

## Issues Encountered
None beyond the auto-fixed blocking issues documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Clean building project on `redesign/admin-portal` branch ready for parallel Plans 02 and 03
- TanStack Router configured and generating route tree
- shadcn/ui components available for layout and auth work
- TypeScript strict mode enforced from the start

---
*Phase: 01-foundation*
*Completed: 2026-02-09*
