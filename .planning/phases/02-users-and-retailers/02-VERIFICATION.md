---
phase: 02-users-and-retailers
verified: 2026-02-09T20:34:46Z
status: gaps_found
score: 3/5 must-haves verified
must_haves:
  truths:
    - "Admin can view paginated user list with sortable columns and filter by status/date"
    - "Admin can click a user to see full-page detail with tabs (Overview, Orders, Addresses, Devices, Notes)"
    - "Admin can view paginated retailer list with sortable columns and filter by status/date"
    - "Admin can click a retailer to see full-page detail with tabs (Overview, Orders, Notes)"
    - "Status badges show consistent colors across all entities; IDs/emails are copyable with one click"
  artifacts:
    - path: "src/components/shared/DataTable.tsx"
      provides: "Generic server-driven data table with pagination and sorting"
    - path: "src/components/shared/DataTableColumnHeader.tsx"
      provides: "Sortable column header with icon cycling"
    - path: "src/components/shared/EntityDetailHeader.tsx"
      provides: "Stripe-style detail page header with avatar and status"
    - path: "src/components/shared/CopyableField.tsx"
      provides: "Label + value + hover copy button"
    - path: "src/hooks/use-table-params.ts"
      provides: "URL-synced table pagination/sorting state"
    - path: "src/features/users/types.ts"
      provides: "BackendUser to UserViewModel transform"
    - path: "src/features/users/api/user-api.ts"
      provides: "User API functions"
    - path: "src/features/users/api/user-queries.ts"
      provides: "TanStack Query hooks for users"
    - path: "src/features/users/components/UserListPage.tsx"
      provides: "Paginated user list with search and sort"
    - path: "src/features/users/components/UserDetailPage.tsx"
      provides: "User detail page with 5 tabs"
    - path: "src/features/retailers/types.ts"
      provides: "BackendVendor to RetailerViewModel transform"
    - path: "src/features/retailers/api/retailer-api.ts"
      provides: "Retailer API functions"
    - path: "src/features/retailers/api/retailer-queries.ts"
      provides: "TanStack Query hooks for retailers"
    - path: "src/features/retailers/components/RetailerListPage.tsx"
      provides: "Paginated retailer list with search"
    - path: "src/features/retailers/components/RetailerDetailPage.tsx"
      provides: "Retailer detail page with 3 tabs"
  key_links:
    - from: "UserListPage.tsx"
      to: "user-queries.ts"
      via: "useUsersQuery hook"
    - from: "UserDetailPage.tsx"
      to: "user-queries.ts"
      via: "useUserQuery hook"
    - from: "RetailerListPage.tsx"
      to: "retailer-queries.ts"
      via: "useRetailersQuery hook"
    - from: "RetailerDetailPage.tsx"
      to: "retailer-queries.ts"
      via: "useRetailerQuery hook"
    - from: "users/index.tsx route"
      to: "UserListPage.tsx"
      via: "component prop in createFileRoute"
    - from: "users/$userId.tsx route"
      to: "UserDetailPage.tsx"
      via: "component rendering with Route.useParams()"
    - from: "retailers/index.tsx route"
      to: "RetailerListPage.tsx"
      via: "component prop in createFileRoute"
    - from: "retailers/$retailerId.tsx route"
      to: "RetailerDetailPage.tsx"
      via: "component rendering with Route.useParams()"
gaps:
  - truth: "Admin can view paginated user list with sortable columns and filter by status/date"
    status: partial
    reason: "Paginated list and sortable columns work. But no status filter or date range filter UI exists."
    artifacts:
      - path: "src/features/users/components/UserListPage.tsx"
        issue: "Only has search input. No status dropdown filter. No date range picker."
    missing:
      - "Status filter dropdown (or similar) on user list page"
      - "Date range filter on user list page"
  - truth: "Admin can view paginated retailer list with sortable columns and filter by status/date"
    status: partial
    reason: "Paginated list exists with search. But no status/date filter UI, and client-side sorting is not implemented (unlike user list which has it)."
    artifacts:
      - path: "src/features/retailers/components/RetailerListPage.tsx"
        issue: "No status dropdown filter. No date range picker. No client-side sort logic -- clicking sortable columns updates URL params but does not visually re-sort data."
    missing:
      - "Status filter dropdown on retailer list page"
      - "Date range filter on retailer list page"
      - "Client-side sorting logic (useMemo with sort) matching the pattern in UserListPage"
---

# Phase 2: Users & Retailers Verification Report

**Phase Goal:** User and retailer list pages with data tables, plus full-page detail views with tabs
**Verified:** 2026-02-09T20:34:46Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin can view paginated user list with sortable columns and filter by status/date | PARTIAL | Paginated DataTable with search and client-side sorting works. Missing: no status filter, no date range filter. |
| 2 | Admin can click a user to see full-page detail with tabs (Overview, Orders, Addresses, Devices, Notes) | VERIFIED | UserDetailPage renders EntityDetailHeader + 5 tabs. Each tab has real implementation with API hooks, loading/empty/error states. Route /users/$userId wired in route tree. |
| 3 | Admin can view paginated retailer list with sortable columns and filter by status/date | PARTIAL | Paginated DataTable with search exists. Missing: no status filter, no date range filter, no client-side sort logic (columns declare enableSorting but data is not sorted). |
| 4 | Admin can click a retailer to see full-page detail with tabs (Overview, Orders, Notes) | VERIFIED | RetailerDetailPage renders EntityDetailHeader + 3 tabs. Each tab has real implementation. Route /retailers/$retailerId wired in route tree. |
| 5 | Status badges show consistent colors across all entities; IDs/emails are copyable with one click | VERIFIED | StatusBadge used consistently across user list, retailer list, order tabs, and detail headers (10 usages found). CopyButton/CopyableField used for emails, phones, IDs, order IDs on both list and detail pages. |

**Score:** 3/5 truths verified (2 partial)

### Required Artifacts

| Artifact | Expected | Status | Lines | Details |
|----------|----------|--------|-------|---------|
| `src/components/shared/DataTable.tsx` | Generic data table | VERIFIED | 207 | Full implementation with server-side pagination, sorting, loading/empty states, page size selector |
| `src/components/shared/DataTableColumnHeader.tsx` | Sortable header | VERIFIED | 58 | Three-state sort cycle with icons |
| `src/components/shared/EntityDetailHeader.tsx` | Detail page header | VERIFIED | 70 | Avatar + title + status + actions layout |
| `src/components/shared/CopyableField.tsx` | Copyable field | VERIFIED | 45 | Label + value + hover copy, mono option |
| `src/hooks/use-table-params.ts` | URL-synced params | VERIFIED | 125 | Reads/writes page, limit, sortBy, sortOrder to URL |
| `src/hooks/use-debounce.ts` | Debounce hook | VERIFIED | 20 | Generic debounce used by retailer search |
| `src/features/users/types.ts` | User types + transform | VERIFIED | 115 | BackendUser, BackendUserAddress, BackendUserDevice, BackendUserOrder, UserViewModel, toUserViewModel |
| `src/features/users/api/user-api.ts` | User API functions | VERIFIED | 64 | getUsers, getUser, getUserAddresses, getUserOrders, getUserDevices |
| `src/features/users/api/user-queries.ts` | User query hooks | VERIFIED | 79 | 5 hooks with query key factory, select transforms, keepPreviousData |
| `src/features/users/components/UserListPage.tsx` | User list page | VERIFIED | 225 | DataTable + search + client-side sort + error state |
| `src/features/users/components/UserDetailPage.tsx` | User detail page | VERIFIED | 106 | EntityDetailHeader + 5 tabs + loading/error states |
| `src/features/users/components/UserOverviewTab.tsx` | Overview tab | VERIFIED | 94 | Contact info + account details cards with CopyableField |
| `src/features/users/components/UserOrdersTab.tsx` | Orders tab | VERIFIED | 155 | Mini table with order ID, retailer, status, total, date |
| `src/features/users/components/UserAddressesTab.tsx` | Addresses tab | VERIFIED | 101 | Card grid with address details, coordinates |
| `src/features/users/components/UserDevicesTab.tsx` | Devices tab | VERIFIED | 96 | Card grid with platform, OS, app version |
| `src/features/users/components/UserNotesTab.tsx` | Notes placeholder | VERIFIED | 12 | Phase 4 placeholder (expected) |
| `src/features/retailers/types.ts` | Retailer types + transform | VERIFIED | 94 | BackendVendor, RetailerViewModel, deriveStatus, toRetailerViewModel |
| `src/features/retailers/api/retailer-api.ts` | Retailer API functions | VERIFIED | 52 | getRetailers, getRetailer, getRetailerOrders |
| `src/features/retailers/api/retailer-queries.ts` | Retailer query hooks | VERIFIED | 66 | 3 hooks with query key factory, select transforms |
| `src/features/retailers/components/RetailerListPage.tsx` | Retailer list page | PARTIAL | 180 | DataTable + search, but no client-side sort logic |
| `src/features/retailers/components/RetailerDetailPage.tsx` | Retailer detail | VERIFIED | 83 | EntityDetailHeader + 3 tabs + loading/error states |
| `src/features/retailers/components/RetailerOverviewTab.tsx` | Overview tab | VERIFIED | 134 | Contact info, business details, description, dates cards |
| `src/features/retailers/components/RetailerOrdersTab.tsx` | Orders tab | VERIFIED | 101 | Simple table with order ID (copyable), customer, status, total, date |
| `src/features/retailers/components/RetailerNotesTab.tsx` | Notes placeholder | VERIFIED | 12 | Phase 4 placeholder (expected) |
| `src/app/routes/_authenticated/users/index.tsx` | User list route | VERIFIED | 6 | createFileRoute wiring to UserListPage |
| `src/app/routes/_authenticated/users/$userId.tsx` | User detail route | VERIFIED | 11 | createFileRoute with Route.useParams() |
| `src/app/routes/_authenticated/retailers/index.tsx` | Retailer list route | VERIFIED | 6 | createFileRoute wiring to RetailerListPage |
| `src/app/routes/_authenticated/retailers/$retailerId.tsx` | Retailer detail route | VERIFIED | 11 | createFileRoute with Route.useParams() |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| UserListPage.tsx | user-queries.ts | useUsersQuery(params) | WIRED | Hook called with search, page, limit params; response used for data + pageCount |
| UserListPage.tsx | /users/$userId | navigate({ to: "/users/$userId" }) | WIRED | onRowClick triggers navigation via useNavigate |
| UserDetailPage.tsx | user-queries.ts | useUserQuery(userId) | WIRED | Data used for header, tabs |
| UserOverviewTab.tsx | UserDetailPage.tsx | { user } prop | WIRED | User view model passed and rendered |
| UserOrdersTab.tsx | user-queries.ts | useUserOrdersQuery(userId) | WIRED | Data rendered in table with loading/empty/error states |
| UserAddressesTab.tsx | user-queries.ts | useUserAddressesQuery(userId) | WIRED | Data rendered in card grid |
| UserDevicesTab.tsx | user-queries.ts | useUserDevicesQuery(userId) | WIRED | Data rendered in card grid |
| users/index.tsx route | UserListPage.tsx | component prop | WIRED | Route renders component |
| users/$userId.tsx route | UserDetailPage.tsx | JSX + Route.useParams() | WIRED | Params extracted, passed to component |
| RetailerListPage.tsx | retailer-queries.ts | useRetailersQuery(params) | WIRED | Hook called with name, page, limit; response used for data + totalPages |
| RetailerListPage.tsx | /retailers/$retailerId | TanStack Router Link | WIRED | Name column uses <Link> component |
| RetailerDetailPage.tsx | retailer-queries.ts | useRetailerQuery(retailerId) | WIRED | Data used for header, tabs |
| RetailerOverviewTab.tsx | RetailerDetailPage.tsx | { retailer } prop | WIRED | Retailer view model passed and rendered |
| RetailerOrdersTab.tsx | retailer-queries.ts | useRetailerOrdersQuery(retailerId) | WIRED | Data rendered in table |
| retailers/index.tsx route | RetailerListPage.tsx | component prop | WIRED | Route renders component |
| retailers/$retailerId.tsx route | RetailerDetailPage.tsx | JSX + Route.useParams() | WIRED | Params extracted, passed to component |
| routeTree.gen.ts | all route files | auto-generated | WIRED | /users/, /users/$userId, /retailers/, /retailers/$retailerId all present |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| LIST-01: User list with sortable columns | SATISFIED | Client-side sort within page (backend limitation documented) |
| LIST-02: Retailer list with sortable columns | PARTIAL | Sort columns declared but no client-side sort logic |
| LIST-05: Filter by status and date range | BLOCKED | No filter UI on either list page |
| LIST-06: Server-side pagination | SATISFIED | Both lists use api.getRaw with page/limit params, PaginatedResponse<T> preserves meta |
| DETL-01: User detail with 5 tabs | SATISFIED | All 5 tabs implemented (Notes is Phase 4 placeholder, as planned) |
| DETL-02: Retailer detail with 3 tabs | SATISFIED | All 3 tabs implemented (Notes is Phase 4 placeholder, as planned) |
| DETL-05: Consistent status badges | SATISFIED | StatusBadge used consistently across all entity views |
| DETL-06: Copyable IDs, emails, phones | SATISFIED | CopyButton and CopyableField used throughout list and detail pages |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| RetailerNotesTab.tsx | 8 | "Notes coming soon" | Info | Expected Phase 4 placeholder |
| UserNotesTab.tsx | 9 | "Notes will be available in Phase 4" | Info | Expected Phase 4 placeholder |
| UserListPage.tsx | 105 | `status: "active" as EntityStatus` (in types.ts:105) | Info | Backend has no user status field; documented known limitation |
| UserOrdersTab.tsx | 93 | `useMemo(() => columns, [])` | Info | Empty dependency array is intentional (stable reference), not a bug |

No blockers or warnings from anti-pattern scan. All "coming soon" items are documented Phase 4 deferrals. No `as any`, no empty returns, no TODO/FIXME comments.

### Human Verification Required

### 1. Visual Appearance of Data Tables
**Test:** Navigate to /users and /retailers. Verify table renders with proper alignment, column headers, pagination bar, and page size selector.
**Expected:** Clean data table matching Stripe dashboard aesthetic. Pagination shows "Showing X-Y of Z" with prev/next buttons and page size dropdown.
**Why human:** Visual layout and alignment cannot be verified programmatically.

### 2. Search Debounce Behavior
**Test:** Type in the search input on /users page. Observe network requests.
**Expected:** API call fires 300ms after last keystroke, not on every keystroke. Table shows loading state during fetch.
**Why human:** Timing and animation behavior require real browser observation.

### 3. User Detail Page Tab Navigation
**Test:** Click a user in the list, then click through all 5 tabs (Overview, Orders, Addresses, Devices, Notes).
**Expected:** Each tab loads its content with appropriate loading state. Data displays in cards/tables. Empty states show when no data.
**Why human:** Tab switching behavior and content rendering need visual confirmation.

### 4. Retailer Detail Page with Status Derivation
**Test:** View a retailer detail page. Check that status badge shows "active" (online + active), "inactive" (active but offline), or "blocked" (not active).
**Expected:** Status badge color matches the derived status correctly.
**Why human:** Need real retailer data to verify status derivation logic produces correct visual output.

### 5. Copy Button Functionality
**Test:** Hover over an email in the user list. Click the copy button. Paste elsewhere.
**Expected:** Value is copied to clipboard. Toast notification confirms copy.
**Why human:** Clipboard API interaction requires real browser environment.

### 6. Dark Mode on New Pages
**Test:** Toggle dark mode while on user list, user detail, retailer list, retailer detail pages.
**Expected:** All components (tables, cards, tabs, headers, badges) render correctly in both light and dark themes.
**Why human:** Visual theming requires human eyes.

### Gaps Summary

Two gaps prevent full goal achievement:

**1. No status/date filters on list pages (LIST-05).** Both the user list and retailer list only have a search input. The success criteria requires "filter by status/date" which implies a status dropdown filter and a date range picker. Neither exists. This is a missing feature, not a stub -- the filter UI was never created.

**2. Retailer list missing client-side sort logic.** The user list page has a `sortedUsers` useMemo that sorts the current page data client-side (since the backend does not support sort params). The retailer list page declares sortable columns (`enableSorting: true` on Name and Created) and passes sorting state to DataTable, but does NOT have a corresponding client-side sort. Clicking the sort headers will update URL params but the table data will not visually re-sort. This is a bug/omission -- the pattern from UserListPage needs to be replicated.

Both gaps are addressable without architectural changes. The filter gap needs new UI components (status dropdown, date range picker) and corresponding API param wiring. The sort gap is a straightforward copy of the `sortedUsers` pattern from UserListPage into RetailerListPage.

---

*Verified: 2026-02-09T20:34:46Z*
*Verifier: Claude (gsd-verifier)*
