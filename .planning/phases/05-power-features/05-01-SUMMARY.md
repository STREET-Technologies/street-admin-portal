# Phase 5 Plan 1: Cross-Entity Navigation Links Summary

Cross-entity clickable links on all detail page tables -- order IDs, retailer names, and row clicks for fast admin navigation.

## What Was Done

### Task 1: Add cross-entity links in UserOrdersTab
- Imported `Link` from TanStack Router
- Order ID column: wrapped in `Link` to `/orders/$orderId` with `text-primary hover:underline` styling
- Retailer column: conditionally wrapped in `Link` to `/retailers/$retailerId` when `retailerId` is present, plain text fallback otherwise
- CopyButton remains alongside order ID, unaffected

### Task 2: Add cross-entity links in RetailerOrdersTab
- Imported `Link` and `useNavigate` from TanStack Router
- Order ID column: wrapped in `Link` to `/orders/$orderId` with matching style
- Order number display improved (shows `orderNumber` with fallback to truncated ID)
- Row click handler: navigates to order detail, skips button/link clicks via `target.closest()` check
- Customer names remain plain text (backend `/admin/vendors/:id/orders` endpoint does not return `customerId`)
- Added `cursor-pointer` class to rows for discoverability

### Task 3: Add row click navigation in OrderListPage
- Added `onRowClick` prop to `DataTable` component (generic, reusable)
- DataTable applies `cursor-pointer` class and click handler only when `onRowClick` is provided
- Click handler skips interactive elements (buttons, links) to preserve CopyButton behavior
- OrderListPage passes `onRowClick` that navigates to `/orders/$orderId`

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Customer names in RetailerOrdersTab are plain text | Backend `/admin/vendors/:id/orders` returns `BackendVendorOrder` which has no `customerId` field; adding it requires backend changes |
| Generic `onRowClick` prop on DataTable | Reusable across all list pages, not just orders; cleaner than per-page row wrapping |
| `target.closest("button" \| "a")` guard pattern | Consistent across RetailerOrdersTab and DataTable; prevents navigation when interacting with copy buttons or links |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] DataTable onRowClick prop**
- **Found during:** Task 3
- **Issue:** DataTable had no row click support; plan suggested adding onClick directly to rows in OrderListPage, but DataTable renders the rows internally
- **Fix:** Added optional `onRowClick` prop to the shared DataTable component with proper interactive element guarding
- **Files modified:** `src/components/shared/DataTable.tsx`
- **Commit:** 77248cf

**2. [Rule 3 - Blocking] Customer ID unavailable in retailer orders**
- **Found during:** Task 2
- **Issue:** Plan suggested adding `customerId` to `OrderViewModel` from `BackendOrder.user.id`, but `RetailerOrdersTab` uses `BackendVendorOrder` (different type from vendor orders endpoint) which lacks customer ID
- **Fix:** Left customer names as plain text; would require backend changes to return customer ID in vendor orders endpoint
- **Files not modified:** No changes needed, kept existing behavior

## Verification

- [x] `npm run build` succeeds without errors
- [x] UserOrdersTab: order IDs and retailer names are clickable links
- [x] RetailerOrdersTab: order IDs are clickable links, rows are clickable
- [x] OrderListPage: clicking a row navigates to order detail
- [x] All links navigate to correct entity detail pages
- [x] CopyButton clicks don't trigger navigation
- [x] No TypeScript errors

## Files Modified

| File | Changes |
|------|---------|
| `src/features/users/components/UserOrdersTab.tsx` | Added Link imports, order ID and retailer name links |
| `src/features/retailers/components/RetailerOrdersTab.tsx` | Added Link/navigate, order ID links, row click handler |
| `src/components/shared/DataTable.tsx` | Added onRowClick prop with interactive element guarding |
| `src/features/orders/components/OrderListPage.tsx` | Added onRowClick to DataTable usage |

## Performance

- **Duration:** ~2 min
- **Tasks:** 3/3
- **Commits:** 3 (one per task)
