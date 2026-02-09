---
phase: 01-foundation
plan: 04
subsystem: navigation, layout, routing
tags: [tanstack-router, sidebar, breadcrumbs, dark-mode, protected-routes, app-shell]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: Shared UI components (PageHeader, EmptyState, LoadingState)
  - phase: 01-foundation/01-03
    provides: Auth system (AuthProvider, useAuth, LoginPage)
provides:
  - TanStack Router file-based routing with auto-generated route tree
  - App shell with Stripe-style sidebar, breadcrumbs, theme toggle
  - Protected route guard redirecting unauthenticated users to /login
  - Post-login redirect preserving originally-attempted URL
  - Placeholder pages for all 6 sections
  - Dark mode with system preference detection
affects: [02-users-retailers, 03-couriers-orders-search, all feature phases]

# Tech tracking
tech-stack:
  added: [next-themes (dark mode)]
  patterns: [file-based routing, layout routes, provider composition, auth guard wrapper]

key-files:
  created:
    - src/app/App.tsx
    - src/app/providers.tsx
    - src/app/layout/AppLayout.tsx
    - src/app/layout/AppSidebar.tsx
    - src/app/layout/Breadcrumbs.tsx
    - src/app/layout/ProtectedRoute.tsx
    - src/app/layout/ThemeToggle.tsx
    - src/app/routes/__root.tsx
    - src/app/routes/login.tsx
    - src/app/routes/_authenticated.tsx
    - src/app/routes/_authenticated/index.tsx
    - src/app/routes/_authenticated/users/index.tsx
    - src/app/routes/_authenticated/retailers/index.tsx
    - src/app/routes/_authenticated/couriers/index.tsx
    - src/app/routes/_authenticated/orders/index.tsx
    - src/app/routes/_authenticated/referrals/index.tsx
    - src/app/routes/_authenticated/settings/index.tsx
    - src/constants/navigation.ts
  modified:
    - src/main.tsx
    - src/features/auth/components/LoginPage.tsx
    - src/features/auth/context/AuthProvider.tsx

key-decisions:
  - "Provider composition in src/app/providers.tsx -- single file wrapping all providers"
  - "_authenticated layout route wraps ProtectedRoute + AppLayout for all auth-required pages"
  - "Login route validates search params with zod for type-safe redirect URL"

patterns-established:
  - "Route structure: __root.tsx > login.tsx (public) | _authenticated.tsx (guarded layout)"
  - "Navigation config: centralized navGroups array in src/constants/navigation.ts"
  - "Active nav state: pathname.startsWith(item.href) comparison"
  - "Post-login redirect: ProtectedRoute saves redirect URL, LoginPage reads and navigates"

# Metrics
duration: ~15min (includes human verification checkpoint)
completed: 2026-02-09
---

# Phase 1 Plan 4: App Shell Summary

**Complete app shell with TanStack Router file-based routing, Stripe-style sidebar, breadcrumbs, dark mode toggle, protected routes, and placeholder pages for all 6 sections**

## Performance

- **Duration:** ~15 min (includes checkpoint + dev bypass fix)
- **Tasks:** 2 auto + 1 human-verify checkpoint
- **Files created:** 18
- **Files modified:** 3

## Accomplishments
- TanStack Router file-based routing with Vite plugin auto-generating routeTree.gen.ts
- Composed providers (Theme, QueryClient, Auth, Tooltip, Toaster, DevTools) in single providers.tsx
- Stripe-style sidebar with 3 groups (Customers, Operations, System), 6 nav items, active highlighting
- Dynamic breadcrumbs from pathname with shadcn/ui Breadcrumb components
- Dark mode toggle (light/dark/system) using next-themes with OS preference detection
- ProtectedRoute auth guard redirecting to /login with redirect URL preservation
- Post-login redirect: LoginPage navigates to saved redirect URL or /users after authentication
- Placeholder pages for Users, Retailers, Couriers, Orders, Referrals, Settings
- Root authenticated index redirects to /users

## Task Commits

1. **Task 1: Create routing structure with TanStack Router** - `f7c157f` (feat)
2. **Task 2: Create app shell with sidebar, breadcrumbs, theme toggle** - `9fd65e0` (feat)
3. **Fix: Dev bypass login and post-login redirect** - `ccf9052` (fix)

## Fixes During Checkpoint

Two issues found during human verification:

1. **Dev bypass login failed silently**: `login()` always called `validateToken()` which hit `/auth/me` with the fake "dev-bypass-token". Backend rejected it, tokens cleared, user bounced back to login. Fixed by allowing `login()` to accept an optional `AuthUser` to skip API validation.

2. **No post-login redirect**: LoginPage had no logic to redirect after `isAuthenticated` became true. Added `Navigate` component that redirects to the saved redirect URL (from search params) or `/users`.

## Deviations from Plan

- Added zod-validated search params to login route (not in original plan but necessary for type-safe redirect)
- Modified AuthProvider.login signature to accept optional user (needed for dev bypass to work without backend)

## Issues Encountered

- Dev bypass auth flow required modification to support skipping backend validation
- LoginPage needed redirect logic that wasn't specified in the plan

## Next Phase Readiness
- Complete app shell ready for feature development
- All 6 section pages have placeholder content ready to be replaced
- Navigation, routing, auth, and theme systems all operational
- Phase 2 can start building Users and Retailers features into the existing shell

---
*Phase: 01-foundation*
*Completed: 2026-02-09*
