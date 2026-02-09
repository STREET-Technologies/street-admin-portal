# Codebase Concerns

**Analysis Date:** 2026-02-09

## Tech Debt

**Hardcoded placeholder values in API transformations:**
- Issue: Multiple fields return hardcoded defaults instead of real backend data
- Files: `src/services/api.ts` (lines 57-67, 80-85)
- Hardcoded fields: `totalOrders: 0`, `totalRevenue: 0`, `commissionRate: '10%'`, `owner: ''`, `status: 'active'`, `deviceId: ''`, `totalSpent: 0`
- Impact: Dashboard shows incomplete user/retailer data - no real revenue, order counts, or commission rates
- Fix approach: Implement missing fields in backend API, remove hardcoded values

**Scattered token management:**
- Issue: Multiple components directly access localStorage for auth tokens instead of using ApiService
- Files: `src/components/ReferralSettingsDialog.tsx`, `src/components/settings/ReferralSettingsTab.tsx`, `src/components/user-tabs/ReferralsTab.tsx`
- Impact: If token format changes or refresh logic is needed, all components need updates
- Fix approach: Route all API calls through `src/services/api.ts` which already centralizes token retrieval

**Decentralized API_BASE_URL definition:**
- Issue: Multiple components define their own API_BASE_URL from env var instead of importing from a single source
- Files: `src/pages/Index.tsx`, `src/components/Login.tsx`, `src/components/ReferralSettingsDialog.tsx`, `src/components/settings/ReferralSettingsTab.tsx`, `src/services/api.ts`
- Impact: Inconsistency risk if URL pattern changes
- Fix approach: Export API_BASE_URL from `src/services/api.ts` or a shared config module

## Known Bugs

**Logout sends request with cleared token:**
- Symptoms: Logout API call likely receives `Bearer null` and fails with 401
- Trigger: Any logout action
- File: `src/pages/Index.tsx` (lines 54-64)
- Root cause: `localStorage.removeItem('access_token')` is called BEFORE the `POST /auth/logout` fetch that reads from localStorage
- Fix: Move token removal to after the API call completes

**Hardcoded URL in ReferralsTab:**
- Symptoms: Referral user code fetching breaks if backend URL changes
- File: `src/components/user-tabs/ReferralsTab.tsx` (line 41)
- Root cause: Direct hardcoded `http://localhost:8080/v1/referrals/admin/users/${userId}/code` without env var fallback
- Fix: Use `VITE_API_URL` env var or route through ApiService

## Security Considerations

**Dev bypass mode in Login:**
- Risk: `VITE_DEV_BYPASS_AUTH=true` env var could accidentally be set in production, allowing unauthenticated access
- File: `src/components/Login.tsx` (lines 7, 73-82)
- Current mitigation: Warning banner displayed when active
- Recommendations: Ensure `VITE_DEV_BYPASS_AUTH` is never set in production builds; consider compile-time removal

**Relaxed TypeScript configuration:**
- Risk: `strict: false`, `strictNullChecks: false`, `noImplicitAny: false` mask potential runtime errors
- File: `tsconfig.app.json`
- Current mitigation: None
- Recommendations: Incrementally enable strict checks, starting with `strictNullChecks`

**Unvalidated API response casting:**
- Risk: Backend could return malformed data that gets cast via `as T` without validation
- File: `src/services/api.ts` (lines 136-141)
- Current mitigation: None
- Recommendations: Add Zod schema validation for critical API responses

## Performance Bottlenecks

No significant performance issues detected. The application is a lightweight admin dashboard with:
- TanStack React Query for caching
- Lazy-loading of tab data (addresses, orders, notes loaded on demand)
- No identified N+1 or waterfall patterns

## Fragile Areas

**OverviewTab component:**
- File: `src/components/user-tabs/OverviewTab.tsx` (595 lines)
- Why fragile: Handles profile editing, address management, device display, avatar upload, and multiple entity types in one file
- Common failures: State management complexity across multiple editable sections
- Safe modification: Extract address section and device section into sub-components
- Test coverage: None

**API data transformation:**
- File: `src/services/api.ts` (lines 46-88)
- Why fragile: Backend-to-frontend entity mapping with field renaming, optional chaining, fallbacks
- Common failures: Backend schema changes break silent transformations
- Safe modification: Add tests for transformation functions before modifying
- Test coverage: None

## Scaling Limits

Not applicable - this is an internal admin tool with limited concurrent users.

## Dependencies at Risk

**next-themes 0.3.0:**
- Risk: Named "next-themes" but used in a Vite/React project (not Next.js) - unconventional usage
- Impact: Theme switching could break on version updates
- Migration plan: Consider native CSS custom properties approach or a React-specific theme library

## Missing Critical Features

**Backend search suggestions endpoint:**
- Problem: SearchService has suggestion logic but it's disabled in production (backend endpoint doesn't exist)
- File: `src/services/searchService.ts` (line 144)
- Current workaround: Only direct search works, no autocomplete suggestions from backend
- Blocks: Type-ahead search experience

## Test Coverage Gaps

**Complete absence of tests:**
- What's not tested: Entire codebase (0% coverage)
- Risk: Any refactoring or feature addition could introduce regressions undetected
- Priority: High
- Critical untested areas:
  - API data transformations (`src/services/api.ts`)
  - Search routing logic (`src/services/searchService.ts`)
  - Auth flow (`src/pages/Index.tsx`, `src/components/Login.tsx`)
  - Form validation in referral code creation (`src/components/ReferralCodesCard.tsx`)

## Additional Concerns

**Incomplete .env.example:**
- File: `.env.example`
- Issue: Missing `VITE_DEV_BYPASS_AUTH` and `VITE_USE_MOCK_DATA` vars
- Impact: New developers won't discover these dev features without reading code

**Console logging in production:**
- Issue: ~38 console statements across ~13 files (console.error, console.log)
- Impact: Debug noise in production browser console
- Fix: Remove or wrap in dev-only conditions

**Missing input validation in referral creation:**
- File: `src/components/ReferralCodesCard.tsx` (lines 53-61)
- Issue: `parseFloat()`/`parseInt()` on reward values without NaN checking
- Impact: Could submit NaN values to backend
- Fix: Add numeric validation before API call

**Unhandled date parsing:**
- File: `src/components/user-tabs/OverviewTab.tsx` (line 38)
- Issue: `new Date(editData.joinDate)` without validating the date string format
- Impact: Invalid dates produce NaN in days-since calculation
- Fix: Add date validation or use date-fns parse with format checking

---

*Concerns audit: 2026-02-09*
*Update as issues are fixed or new ones discovered*
