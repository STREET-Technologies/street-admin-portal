# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Fast, intuitive customer support workflows — find any user or order in seconds and resolve issues without friction.
**Current focus:** Phase 3 in progress — executing plans

## Current Position

Phase: 3 of 5 (Couriers, Orders & Search) — IN PROGRESS
Plan: 1 of 4 complete in Phase 3
Status: In progress
Last activity: 2026-02-09 — Completed 03-01-PLAN.md

Progress: ██░░░░░░░░ 25% (Phase 3)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: ~4 min
- Total execution time: ~39 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | ~20 min | ~5 min |
| 2. Users & Retailers | 4/4 | ~15 min | ~3.7 min |
| 3. Orders & Search | 1/4 | ~4 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 02-02 (3m), 02-03 (4m), 02-04 (checkpoint), 03-01 (4m)
- Trend: Steady, consistent ~4 min

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Vite + React over Next.js (no SSR needed for internal tool)
- Keep shadcn/ui as component library
- Frontend-first, backend fixes later
- New branch `redesign/admin-portal` off main
- Stripe Dashboard as design reference
- @vitejs/plugin-react-swc v4 for Vite 6 compatibility (01-01)
- Removed bun.lockb; npm is the package manager (01-01)
- String literal unions over enums for status types (01-02)
- Custom StatusBadge with dot indicator for Stripe-style status display (01-02)
- ky HTTP client over raw fetch for hook system (01-03)
- Response envelope unwrapping in API client layer (01-03)
- Logout calls API before clearing localStorage -- fixes existing bug (01-03)
- Provider composition in src/app/providers.tsx (01-04)
- Login route validates search params with zod for type-safe redirect (01-04)
- login() accepts optional user param for dev bypass (01-04)
- useSearch({ strict: false }) for reusable table params hook (02-01)
- Three-state sort cycle: unsorted -> asc -> desc -> unsorted (02-01)
- Page size options: 10/20/50, default 20 (02-01)
- api.getRaw for paginated responses that need both data and meta (02-02)
- Client-side sorting within page data when backend lacks sort params (02-02)
- Each detail tab as separate component file for maintainability (02-02)
- Plain table for orders mini-table (no TanStack Table overhead for non-paginated data) (02-03)
- Shared useDebounce hook for search input debouncing across features (02-03)
- GBP currency formatting for order totals (backend stores pence) (02-03)
- Client-side status filtering within page (backend lacks filter params) (02-04)
- Dev bypass 401 skip in api-client (fake token causes 401 on all API calls) (02-04)
- Button forwardRef for Radix asChild compatibility (02-04)
- Couriers descoped from Phase 3: no backend entity exists (Stuart third-party only) (03-planning)
- No global admin orders endpoint: order list scoped by vendor (03-planning)
- Global search aggregates user + vendor search endpoints in parallel (03-planning)
- Vendor selector auto-selects first vendor for order list (03-01)
- VendorOrdersRawResponse for nested vendor orders envelope (03-01)
- Client-side search within vendor's orders page (03-01)
- Raw amount field (totalAmountRaw) for correct numeric sorting on Total column (03-01)

### Pending Todos

None.

### Blockers/Concerns

- Backend has no user status field -- all users show as "active" (cosmetic, not blocking)
- Backend has no sorting/filtering params -- client-side sort/filter is page-only
- Google OAuth redirect URI propagation may take time for local dev
- No `GET /admin/orders` endpoint -- order list must be scoped by vendor
- No courier entity in backend -- couriers page stays as placeholder

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 03-01-PLAN.md (Order Feature Module)
Resume file: None
