# Phase 3 Plan 1: Order Feature Module Summary

**One-liner:** Order feature module with types, API, query hooks, and vendor-scoped list page using DataTable

## What Was Done

### Task 1: Create order types and transforms
- Created `src/features/orders/types.ts` with BackendOrder, BackendOrderItem, BackendPayment interfaces
- OrderViewModel with formatted GBP currency string and raw amount for sorting
- `toOrderViewModel` transform with customer name/email fallback chain (customerName -> user.firstName/lastName -> "Unknown")
- `formatGBP` helper converts pence to GBP currency string using Intl.NumberFormat

### Task 2: Create order API functions
- Created `src/features/orders/api/order-api.ts`
- `getOrdersByVendor` hits `GET /admin/vendors/:vendorId/orders` with pagination, uses `api.getRaw` for nested envelope
- `getOrdersByUser` hits `GET /admin/users/:userId/orders` with pagination, uses `api.get` with envelope unwrap
- `VendorOrdersRawResponse` type for the nested `{ message, data: { orders, meta } }` response shape

### Task 3: Create order query hooks
- Created `src/features/orders/api/order-queries.ts`
- `orderKeys` factory with vendor-scoped and user-scoped list keys
- `useVendorOrdersQuery` with pagination, `keepPreviousData`, and `toOrderViewModel` transform in select
- `useUserOrdersQuery` with `toOrderViewModel` transform in select

### Task 4: Create OrderListPage
- Created `src/features/orders/components/OrderListPage.tsx`
- Vendor selector dropdown — auto-selects first vendor since no global orders endpoint exists
- Search filter by order ID or customer name with debounce
- Status filter dropdown with all OrderStatus values
- 7 columns: Order ID (mono, copyable), Customer (name + email), Retailer, Status (badge), Total (GBP), Items, Date
- Client-side sorting with raw amount comparison for Total column
- Row click navigates to `/orders/$orderId`
- Created placeholder order detail route at `src/app/routes/_authenticated/orders/$orderId.tsx`

### Task 5: Wire order list route
- Updated `src/app/routes/_authenticated/orders/index.tsx` to render `OrderListPage`
- Removed placeholder "coming soon" content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created placeholder order detail route**
- **Found during:** Task 4
- **Issue:** OrderListPage navigates to `/orders/$orderId` but no route file existed. TanStack Router's type-safe navigation would fail at build time.
- **Fix:** Created `src/app/routes/_authenticated/orders/$orderId.tsx` with a placeholder component
- **Files created:** `src/app/routes/_authenticated/orders/$orderId.tsx`
- **Commit:** d5d07d8

**2. [Rule 1 - Bug] Adapted API response shape for vendor orders endpoint**
- **Found during:** Task 2
- **Issue:** The vendor orders endpoint returns a nested envelope `{ message, data: { orders, meta } }` which differs from the standard `{ data, meta }` PaginatedResponse. Using the standard type would fail.
- **Fix:** Created `VendorOrdersRawResponse` type and used `api.getRaw` to handle the nested structure, extracting `response.data.orders` and `response.data.meta` in the query hook select.
- **Files modified:** `src/features/orders/api/order-api.ts`, `src/features/orders/api/order-queries.ts`
- **Commit:** 50dfdbf, bee2306

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Vendor selector auto-selects first vendor | No global orders endpoint; must scope by vendor. First vendor selection gives immediate data display. |
| Client-side search within vendor's orders page | Backend vendor orders endpoint has no search param; filter locally after fetch |
| VendorOrdersRawResponse for nested envelope | Vendor orders endpoint returns `{ message, data: { orders, meta } }`, not standard PaginatedResponse |
| Raw amount field for sort comparison | totalAmount is formatted string; need totalAmountRaw (number) for correct numeric sorting |

## Commits

| Hash | Message |
|------|---------|
| 738a997 | feat(03-01): create order types and backend-to-viewmodel transform |
| 50dfdbf | feat(03-01): create order API functions for vendor and user endpoints |
| bee2306 | feat(03-01): create order query hooks with key factory |
| d5d07d8 | feat(03-01): create OrderListPage with vendor selector and filters |
| 11b270d | feat(03-01): wire order list route to OrderListPage component |
| 433b01f | chore(03-01): remove .gitkeep files from orders feature directories |

## Files Changed

### Created
- `src/features/orders/types.ts` — Backend types, OrderViewModel, toOrderViewModel transform
- `src/features/orders/api/order-api.ts` — getOrdersByVendor, getOrdersByUser API functions
- `src/features/orders/api/order-queries.ts` — orderKeys factory, useVendorOrdersQuery, useUserOrdersQuery hooks
- `src/features/orders/components/OrderListPage.tsx` — Full order list page with vendor selector
- `src/app/routes/_authenticated/orders/$orderId.tsx` — Placeholder order detail route

### Modified
- `src/app/routes/_authenticated/orders/index.tsx` — Replaced placeholder with OrderListPage

### Removed
- `src/features/orders/api/.gitkeep`
- `src/features/orders/components/.gitkeep`

## Verification

- `npm run build` passes with zero TypeScript errors
- All order types compile with strict mode
- Build output: 1929 modules, 652 kB JS bundle

## Duration

~4 minutes (2026-02-09T20:55:39Z to 2026-02-09T20:59:30Z)
