# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Fast, intuitive customer support workflows — find any user or order in seconds and resolve issues without friction.
**Current focus:** Phase 5 in progress — Power Features

## Current Position

Phase: 5 of 5 (Power Features)
Plan: 3 of 3
Status: In progress
Last activity: 2026-02-09 — Completed 05-03-PLAN.md

Progress: ███████████████░░ 88% (Phase 5: 1/3 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 15
- Average duration: ~4 min
- Total execution time: ~55 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | ~20 min | ~5 min |
| 2. Users & Retailers | 4/4 | ~15 min | ~3.7 min |
| 3. Orders & Search | 4/4 | ~15 min | ~3.7 min |
| 4. Notes, Referrals & Settings | 2/2 | ~3 min | ~1.5 min |
| 5. Power Features | 1/3 | ~2 min | ~2 min |

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
- No global admin orders endpoint: order list scoped by vendor (03-01)
- VendorOrdersRawResponse for nested vendor orders envelope (03-01)
- Vendor selector auto-selects first vendor for order list (03-01)
- Order detail uses query cache lookup — no GET /admin/orders/:id endpoint (03-02)
- Global search aggregates user + vendor search via Promise.allSettled (03-03)
- cmdk command palette with Cmd+K keyboard shortcut (03-03)
- Google OAuth not working in production — needs investigation (ongoing)
- REFL-01/REFL-02 descoped from Phase 4: no admin referral endpoints in backend (04-planning)
- BackendUserDevice type mismatch with FcmToken entity — FIXED in 04-02
- Referral settings (INFR-07 partial) deferred to Phase 5 settings page (04-planning)
- BackendUserDevice aligned to FcmToken entity fields (04-02)
- Referrals page uses structured Card with endpoint list instead of generic EmptyState (04-02)
- Shared NotesPanel component reused by UserNotesTab and RetailerNotesTab (04-01)
- Controlled form state (useState) for simple note creation form (04-01)
- Backend uses 'vendor' for retailer entityType -- mapped in RetailerNotesTab (04-01)
- Custom relativeTime helper over Intl.RelativeTimeFormat for compact "2h ago" display (05-03)
- Shared ActivityTimeline component reusable across any entity type (05-03)

### Pending Todos

None.

### Blockers/Concerns

- Backend has no user status field -- all users show as "active" (cosmetic, not blocking)
- Backend has no sorting/filtering params -- client-side sort/filter is page-only
- Google OAuth not working in production (was working before, no changes made)
- No `GET /admin/orders` endpoint -- order list must be scoped by vendor
- No courier entity in backend -- couriers page explains Stuart integration
- No admin referral endpoints -- cannot list/search/manage referral codes from admin portal

## Session Continuity

Last session: 2026-02-09
Stopped at: Completed 05-03-PLAN.md (activity timeline)
Resume file: None
