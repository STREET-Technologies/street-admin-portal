# Phase 2 Plan 2: User Feature -- Types, API, List Page, Detail Page Summary

**One-liner:** Complete user vertical slice with BackendUser-to-ViewModel transform, TanStack Query hooks with paginated API support, searchable DataTable list, and 5-tab detail page.

## What Was Done

### Task 1: Create user types
- BackendUser, BackendUserAddress, BackendUserDevice, BackendUserOrder interfaces matching backend API shapes
- UserViewModel with computed `name` (firstName + lastName with fallback), fallback email/phone, derived `active` status
- `toUserViewModel` transform function used in query `select` option
- Commit: `a64bfaf`

### Task 2: Create user API layer + query hooks
- Added `getRaw` method to api-client.ts to skip envelope unwrapping for paginated responses (preserves `meta`)
- User API functions: getUsers, getUser, getUserAddresses, getUserOrders, getUserDevices
- Query key factory: `userKeys.all`, `.lists()`, `.list(params)`, `.details()`, `.detail(id)`, `.addresses(id)`, `.orders(id)`, `.devices(id)`
- TanStack Query hooks with `select` transforms and `keepPreviousData` for smooth pagination
- Commit: `4823060`

### Task 3: Create user list page
- PageHeader + debounced search input (300ms, useState + useEffect)
- DataTable columns: Name (avatar + name + test badge, clickable), Email (copy), Phone (copy), Status (badge), Created (formatted)
- Client-side sorting within page data (backend has no sort params)
- Error state with retry
- Replaced placeholder route with UserListPage
- Commit: `b2ed373`

### Task 4: Create user detail page with 5 tabs
- UserDetailPage: EntityDetailHeader + Separator + Tabs layout, back navigation button
- UserOverviewTab: Contact Info card (email, phone, language) + Account Details card (ID, role, SSO, dates, test/anonymized badges)
- UserOrdersTab: Mini table with order ID, retailer, status, total, date; empty state fallback
- UserAddressesTab: Card grid of addresses with full address, city, postcode, coordinates; empty state fallback
- UserDevicesTab: Card grid with platform, OS, app version, registration date; empty state fallback
- UserNotesTab: Phase 4 placeholder with EmptyState
- Route file: `src/app/routes/_authenticated/users/$userId.tsx`
- Commit: `bd8eb9a`

### Task 5: Wire up route and verify build
- TanStack Router auto-generated route tree includes `/users/` and `/users/$userId`
- `npm run build` passes with no TypeScript errors
- Commit: `4a9d34a`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Added `getRaw` method to api-client | Paginated responses have `data` and `meta` at same level; `unwrapEnvelope` would strip `meta`. `getRaw` skips unwrapping for these cases |
| Client-side sort within page | Backend has no sorting params. Sort is applied to current page data only. Documented as known limitation |
| Status always "active" | Backend has no user status field. Derived as constant for now |
| Debounce search with useState + useEffect | Simple 300ms debounce without adding a library dependency |
| Each tab as separate component file | Keeps detail page clean, enables lazy loading later, and makes each tab independently testable |
| UserOverviewTab uses Card grid | Two-column layout matching Stripe dashboard pattern for contact info + account details |

## Known Limitations

- **No server-side sorting:** Backend `/admin/users` endpoint does not support sort params. Sorting is client-side within current page only.
- **No user status:** Backend has no status field. All users show as "active".
- **Notes tab is placeholder:** Will be implemented in Phase 4.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added getRaw to api-client for paginated responses**
- **Found during:** Task 2
- **Issue:** `unwrapEnvelope` strips `meta` from paginated responses, losing pagination info
- **Fix:** Added `requestRaw` function and `api.getRaw` method that skips envelope unwrapping
- **Files modified:** `src/lib/api-client.ts`
- **Commit:** `4823060`

## Files Created

| File | Purpose |
|------|---------|
| `src/features/users/types.ts` | Backend + ViewModel types, transform function |
| `src/features/users/api/user-api.ts` | API functions for user endpoints |
| `src/features/users/api/user-queries.ts` | TanStack Query hooks + key factory |
| `src/features/users/components/UserListPage.tsx` | Paginated user list with search |
| `src/features/users/components/UserDetailPage.tsx` | Detail page with tabs |
| `src/features/users/components/UserOverviewTab.tsx` | Overview tab with contact + account cards |
| `src/features/users/components/UserOrdersTab.tsx` | Orders mini-table |
| `src/features/users/components/UserAddressesTab.tsx` | Address card grid |
| `src/features/users/components/UserDevicesTab.tsx` | Device card grid |
| `src/features/users/components/UserNotesTab.tsx` | Phase 4 placeholder |
| `src/app/routes/_authenticated/users/$userId.tsx` | User detail route |

## Files Modified

| File | Change |
|------|--------|
| `src/lib/api-client.ts` | Added `requestRaw` function and `api.getRaw` method |
| `src/app/routes/_authenticated/users/index.tsx` | Replaced placeholder with UserListPage |
| `src/routeTree.gen.ts` | Auto-generated: added `/users/$userId` route |

## Verification

- [x] User types with BackendUser -> UserViewModel transform
- [x] User API layer with query key factory
- [x] TanStack Query hooks for users (list, detail, addresses, orders, devices)
- [x] User list page with paginated DataTable and search
- [x] User detail page with 5 tabs
- [x] Route /users/:userId works
- [x] npm run build passes

## Duration

~3 minutes (2026-02-09T19:48:43Z to 2026-02-09T19:52:04Z)
