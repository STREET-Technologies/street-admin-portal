---
phase: 01-foundation
plan: 03
subsystem: auth, infra
tags: [ky, tanstack-query, oauth, google-auth, api-client, react-context]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Project scaffold with Vite, React 18, TypeScript strict, shadcn/ui
provides:
  - Centralized ky-based API client with auth header injection and 401 redirect
  - TanStack Query client configuration
  - AuthProvider with OAuth callback handling and token validation
  - useAuth hook for consuming auth state
  - LoginPage with Google OAuth and dev bypass
  - authApi module for auth-related API calls
affects: [01-foundation/01-04, 02-users-retailers, all feature modules]

# Tech tracking
tech-stack:
  added: [ky (HTTP client)]
  patterns: [centralized API client with hooks, React Context for auth, response envelope unwrapping]

key-files:
  created:
    - src/lib/api-client.ts
    - src/lib/query-client.ts
    - src/features/auth/types.ts
    - src/features/auth/api/auth-api.ts
    - src/features/auth/context/AuthProvider.tsx
    - src/features/auth/hooks/useAuth.ts
    - src/features/auth/components/LoginPage.tsx
  modified: []

key-decisions:
  - "ky HTTP client over raw fetch for hook system (beforeRequest/afterResponse)"
  - "Response envelope unwrapping in API client layer, not in individual feature modules"
  - "Logout calls API before clearing localStorage (fixes existing bug)"

patterns-established:
  - "API client pattern: all features import api from @/lib/api-client"
  - "Auth context pattern: AuthProvider wraps app, useAuth hook for consumption"
  - "OAuth callback pattern: parse URL hash on mount in AuthProvider"

# Metrics
duration: 2min
completed: 2026-02-09
---

# Phase 1 Plan 3: API Client & Auth System Summary

**Centralized ky-based API client with auth hooks, AuthProvider with Google OAuth callback handling, and LoginPage with STREET branding**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-09T19:05:01Z
- **Completed:** 2026-02-09T19:07:17Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Centralized API client using ky with Bearer token injection, 401 redirect to /login, response envelope unwrapping, and typed convenience methods (get/post/patch/delete)
- TanStack Query client with 2-minute stale time and sensible retry defaults
- Complete auth system: AuthProvider handles OAuth callback (URL hash tokens), validates tokens via /auth/me, and exposes login/logout via React Context
- Fixed the existing logout bug: API call now happens BEFORE clearing localStorage tokens
- LoginPage with STREET branding (Hanson font logo, lime-green gradient), Google OAuth button, and dev bypass mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Create centralized API client and query client** - `b0789a8` (feat)
2. **Task 2: Create AuthProvider, useAuth hook, and auth API** - `85f1f61` (feat)
3. **Task 3: Create Login page** - `bbbf32f` (feat)

## Files Created/Modified
- `src/lib/api-client.ts` - Centralized ky-based API client with auth hooks, error handling, and envelope unwrapping
- `src/lib/query-client.ts` - TanStack Query client configuration with sensible defaults
- `src/features/auth/types.ts` - AuthUser and AuthState type definitions
- `src/features/auth/api/auth-api.ts` - Auth API module (getCurrentUser, logout, getGoogleLoginUrl)
- `src/features/auth/context/AuthProvider.tsx` - Auth state provider with OAuth callback handling and token validation
- `src/features/auth/hooks/useAuth.ts` - Hook to consume auth context
- `src/features/auth/components/LoginPage.tsx` - Login page with Google OAuth, dev bypass, STREET branding

## Decisions Made
- Used ky HTTP client over raw fetch for its hook system (beforeRequest/afterResponse) -- cleaner auth header injection and 401 handling
- Response envelope unwrapping lives in the API client layer (not per-feature) since the backend consistently wraps with { data: T }
- Logout calls API before clearing localStorage -- fixes the existing bug where the old code cleared tokens first, causing the logout API call to fail silently

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- API client and auth system ready for integration with app shell (Plan 04)
- LoginPage ready to be wired into router
- AuthProvider ready to wrap the app in main.tsx
- All features can now import `api` from `@/lib/api-client` for their API calls

---
*Phase: 01-foundation*
*Completed: 2026-02-09*
