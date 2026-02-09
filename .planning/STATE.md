# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Fast, intuitive customer support workflows — find any user or order in seconds and resolve issues without friction.
**Current focus:** Phase 2 — Users & Retailers

## Current Position

Phase: 2 of 5 (Users & Retailers) — IN PROGRESS
Plan: 1 of 4 complete (02-01 Shared Data Table & Entity Detail Components)
Status: In progress
Last activity: 2026-02-09 — Completed 02-01-PLAN.md

Progress: ██░░░░░░░░ 25% (Phase 2)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: ~5 min
- Total execution time: ~24 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | ~20 min | ~5 min |
| 2. Users & Retailers | 1/4 | ~4 min | ~4 min |

**Recent Trend:**
- Last 5 plans: 01-02 (2m), 01-03 (2m), 01-04 (15m incl. checkpoint), 02-01 (4m)
- Trend: Steady

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

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 02-01-PLAN.md
Resume file: None
