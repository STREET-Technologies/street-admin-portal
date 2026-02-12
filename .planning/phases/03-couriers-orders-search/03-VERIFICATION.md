---
phase: 03-couriers-orders-search
verified: 2026-02-09T21:30:00Z
status: gaps_found
score: 2/3 must-haves verified
gaps:
  - truth: "Couriers page explains data is within order details with link to orders"
    status: failed
    reason: "Couriers page still shows Phase 2 placeholder ('coming soon / Phase 3') instead of updated messaging"
    artifacts:
      - path: "src/app/routes/_authenticated/couriers/index.tsx"
        issue: "Still says 'Couriers coming soon' and 'will be built in Phase 3' — not updated per plan 03-02"
    missing:
      - "Update title/description to explain couriers are third-party (Stuart) and data is in order details"
      - "Add link/button to navigate to orders page"
---

# Phase 3: Orders & Search Verification Report

**Phase Goal:** Order list + detail pages plus unified global search. Couriers descoped (no backend entity -- Stuart third-party only).
**Verified:** 2026-02-09T21:30:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin can view order list (scoped by vendor) and click through to full order detail | VERIFIED | OrderListPage (328 lines) renders DataTable with vendor selector, search, status filter, pagination. Row click navigates to `/orders/$orderId`. OrderDetailPage (627 lines) reads from cache and renders full detail. |
| 2 | Order detail shows items, payment, delivery/courier info, customer, retailer, address, pricing | VERIFIED | OrderDetailPage renders 7 card sections: OrderItemsCard, PricingCard, PaymentCard, CustomerCard, RetailerCard, DeliveryCard, AddressCard + OrderMetaCard. Courier info (name, phone, photo, vehicle) displays in DeliveryCard from deliveryDetails JSONB. |
| 3 | Admin can search across users and retailers from a single search bar with grouped type-ahead results | VERIFIED | GlobalSearch (194 lines) uses cmdk CommandDialog with Cmd+K shortcut. Fires parallel requests to user and vendor endpoints via search-api.ts. Results grouped by entity type (Users, Retailers, Orders). Order ID pattern (ST-XXXXX) detected client-side. |

**Score:** 3/3 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/features/orders/types.ts` | Backend types, ViewModels, transforms | VERIFIED | 314 lines. BackendOrder, OrderViewModel, OrderDetailViewModel, toOrderViewModel, toOrderDetailViewModel. Substantive transforms with fallback chains. |
| `src/features/orders/api/order-api.ts` | API functions for vendor/user orders | VERIFIED | 71 lines. getOrdersByVendor (getRaw for nested envelope), getOrdersByUser (get with unwrap). Proper pagination params. |
| `src/features/orders/api/order-queries.ts` | Query hooks with key factory | VERIFIED | 75 lines. orderKeys factory, useVendorOrdersQuery (keepPreviousData, select transform), useUserOrdersQuery. |
| `src/features/orders/components/OrderListPage.tsx` | Order list with DataTable, filters, vendor selector | VERIFIED | 328 lines. Vendor selector, search input with debounce, status filter dropdown, 7-column DataTable, client-side sorting, row click navigation. |
| `src/features/orders/components/OrderDetailPage.tsx` | Full order detail with card sections | VERIFIED | 627 lines. 8 sub-components (OrderItemsCard, PricingCard, PaymentCard, CustomerCard, RetailerCard, DeliveryCard, AddressCard, OrderMetaCard). Cache-based order lookup via useOrderFromCache. Customer links to user detail, retailer links to retailer detail. |
| `src/app/routes/_authenticated/orders/index.tsx` | Route wired to OrderListPage | VERIFIED | 6 lines. createFileRoute with OrderListPage component. |
| `src/app/routes/_authenticated/orders/$orderId.tsx` | Route wired to OrderDetailPage | VERIFIED | 11 lines. createFileRoute with param extraction passing orderId prop. |
| `src/features/search/api/search-api.ts` | Search aggregator with parallel queries | VERIFIED | 106 lines. globalSearch fires getUsers + getRetailers via Promise.allSettled. Transforms to SearchResultItem format. detectOrderId for ST-XXXXX pattern. |
| `src/features/search/api/search-queries.ts` | Query hook with key factory | VERIFIED | 29 lines. searchKeys factory, useGlobalSearchQuery with enabled >= 2 chars, 30s staleTime. |
| `src/features/search/components/GlobalSearch.tsx` | cmdk command palette with trigger | VERIFIED | 194 lines. Trigger button with Cmd+K hint, CommandDialog, debounced search, grouped results (Users/Retailers/Orders), SearchResultRow with avatar/status, navigation on select. |
| `src/app/layout/AppLayout.tsx` | GlobalSearch integrated in header | VERIFIED | Line 10 imports GlobalSearch, line 26 renders between Breadcrumbs and ThemeToggle. |
| `src/app/routes/_authenticated/couriers/index.tsx` | Updated messaging about courier data location | FAILED | Still shows Phase 2 placeholder: "Couriers coming soon" / "will be built in Phase 3". Not updated per plan 03-02 Task 4. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| OrderListPage | order-queries | useVendorOrdersQuery | WIRED | Line 23 imports, line 174 calls with activeVendorId and pagination params. |
| OrderListPage | retailer-queries | useRetailersQuery | WIRED | Line 22 imports, line 165 calls for vendor selector dropdown. |
| OrderListPage | OrderDetailPage | router navigation | WIRED | Line 231 navigates to `/orders/$orderId` on row click. Route file at `$orderId.tsx` receives param. |
| OrderDetailPage | order-queries cache | useOrderFromCache | WIRED | Lines 225-250: useQueryClient scans cached vendor order queries, finds matching order by ID, transforms via toOrderDetailViewModel. |
| OrderDetailPage | user detail | navigate | WIRED | Lines 186-189: Customer name clicks navigate to `/users/$userId`. |
| OrderDetailPage | retailer detail | navigate | WIRED | Lines 196-200: Retailer card clicks navigate to `/retailers/$retailerId`. |
| GlobalSearch | search-api | useGlobalSearchQuery | WIRED | Line 16 imports hook, line 39 calls with debouncedQuery. |
| search-api | user-api | getUsers | WIRED | Line 1 imports, line 64 calls with search param. |
| search-api | retailer-api | getRetailers | WIRED | Line 2 imports, line 65 calls with name param. |
| GlobalSearch | AppLayout | import | WIRED | AppLayout line 10 imports, line 26 renders in header. |
| GlobalSearch | entity detail pages | navigate | WIRED | Line 63 navigates to item.href which includes `/users/{id}`, `/retailers/{id}`, `/orders/{id}`. |
| orders route | OrderListPage | createFileRoute | WIRED | Route component set to OrderListPage. |
| order detail route | OrderDetailPage | createFileRoute | WIRED | Route component extracts orderId param and passes to OrderDetailPage. |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| LIST-04: Paginated order list with sortable columns | SATISFIED | OrderListPage renders DataTable with 7 sortable columns, vendor-scoped pagination. |
| DETL-04: Full order detail (items, payment, delivery, customer, retailer, courier) | SATISFIED | OrderDetailPage shows all 7 card sections with courier info in DeliveryCard. |
| SRCH-01: Search across all entity types from single input | SATISFIED | GlobalSearch fires parallel queries to users and retailers, detects order ID pattern. |
| SRCH-02: Results grouped by entity type with type-ahead suggestions | SATISFIED | CommandGroup sections for Users, Retailers, Orders. Type-ahead via debounced input. |
| SRCH-03: Search supports name, email, phone, and order ID | SATISFIED | Backend user search supports name/email/phone via `?search=` param. Order ID via ST-XXXXX pattern detection. Retailer by name via `?name=` param. |
| LIST-03: Courier list (descoped) | N/A | Correctly descoped -- no backend courier entity. |
| DETL-03: Courier detail (descoped) | N/A | Correctly descoped -- courier info shown in order delivery card instead. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/routes/_authenticated/couriers/index.tsx` | 16 | "Couriers coming soon" | Warning | Outdated placeholder from Phase 2. Should explain couriers are third-party and data is in order details. |
| `src/features/orders/components/OrderDetailPage.tsx` | 65-69 | Unused `rawOrders` variable | Info | Dead code in useOrderDetailFromVendorQuery (unused helper function). The actual lookup uses useOrderFromCache instead. |

### Human Verification Required

### 1. Order List Data Loading
**Test:** Navigate to /orders, verify vendor selector populates and auto-selects first vendor, verify orders load in DataTable.
**Expected:** Vendor dropdown shows all retailers. Orders display with Order ID, Customer, Retailer, Status, Total, Items, Date columns. Pagination controls appear.
**Why human:** Requires live API connection to verify real data rendering and vendor auto-selection behavior.

### 2. Order Detail Cache-Based Navigation
**Test:** Navigate to /orders, click an order row, verify detail page loads with all sections.
**Expected:** Order detail page shows Items table, Pricing Breakdown, Payment, Customer (with link), Retailer (with link), Delivery (with courier info if available), Shipping Address, and Order Info cards.
**Why human:** Detail page uses cache-based lookup -- requires navigating from list page to warm the cache. Deep-linking directly to `/orders/{id}` will show "Order not found".

### 3. Global Search End-to-End
**Test:** Click search button in header (or press Cmd+K), type a known user name, then a retailer name, then an order ID like "ST-12345".
**Expected:** User results appear grouped under "Users" heading. Retailer results appear under "Retailers". Order ID creates a direct link under "Orders". Selecting a result navigates to the correct detail page.
**Why human:** Requires live API data and visual verification of grouped results layout.

### 4. Search Keyboard Shortcut
**Test:** Press Cmd+K (Mac) or Ctrl+K anywhere in the app.
**Expected:** Search dialog opens. Pressing again or Escape closes it.
**Why human:** Keyboard event handling verification.

### Gaps Summary

One minor gap exists: the couriers page (`src/app/routes/_authenticated/couriers/index.tsx`) was not updated per plan 03-02 Task 4. It still shows the Phase 2 placeholder text "Couriers coming soon" / "will be built in Phase 3" instead of explaining that courier data is third-party (Stuart) and is accessible through order detail pages. This is a cosmetic issue -- the actual courier data IS correctly displayed in the order detail DeliveryCard. The couriers page just needs its messaging updated to reflect this reality and include a link to the orders page.

All core functionality (order list, order detail, global search) is substantively implemented, properly wired, and the build passes cleanly with zero TypeScript errors.

---

*Verified: 2026-02-09T21:30:00Z*
*Verifier: Claude (gsd-verifier)*
