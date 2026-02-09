# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Fast, intuitive customer support workflows — find any user or order in seconds and resolve issues without friction.
**Current focus:** Phase 2 complete — ready for Phase 3

## Current Position

Phase: 2 of 5 (Users & Retailers) — COMPLETE
Next: Phase 3 (Couriers, Orders & Search)
Status: Phase 2 complete, Phase 3 not yet planned
Last activity: 2026-02-09 — Completed Phase 2 (all 4 plans + gap fixes)

Progress: ██████████ 100% (Phase 2)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: ~4 min
- Total execution time: ~35 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | ~20 min | ~5 min |
| 2. Users & Retailers | 4/4 | ~15 min | ~3.7 min |

**Recent Trend:**
- Last 5 plans: 02-01 (4m), 02-02 (3m), 02-03 (4m), 02-04 (checkpoint)
- Trend: Steady, accelerating

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

### Pending Todos

None.

### Blockers/Concerns

- Backend has no user status field -- all users show as "active" (cosmetic, not blocking)
- Backend has no sorting/filtering params -- client-side sort/filter is page-only
- Google OAuth redirect URI propagation may take time for local dev

## Session Continuity

Last session: 2026-02-09
Stopped at: Phase 2 complete
Resume file: None
