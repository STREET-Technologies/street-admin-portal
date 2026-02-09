# Testing Patterns

**Analysis Date:** 2026-02-09

## Test Framework

**Runner:**
- None installed

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test commands available
npm run lint                    # Only code quality check available
```

## Current Status

**No test infrastructure exists.** The codebase has zero test files, no test framework, and no testing dependencies.

- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` files
- No `__tests__/` directories
- No test configuration files (no `jest.config.ts`, `vitest.config.ts`)
- No test runners in `package.json` dependencies
- No `@testing-library/react` or similar

## Test File Organization

**Location:**
- Not applicable (no tests exist)

**Naming:**
- Not established

## Available Quality Checks

**ESLint:**
- `npm run lint` - ESLint with typescript-eslint
- Config: `eslint.config.js`

**TypeScript:**
- Type checking via `tsc` (part of build)
- Note: strict mode disabled, reducing type safety

## Mock Data Infrastructure

The codebase has a mock data system that could support testing:

**Mock Data:**
- `src/data/mockData.ts` - Mock users, retailers, couriers, orders
- Toggle: `VITE_USE_MOCK_DATA` env var enables mock mode in SearchService
- `src/services/searchService.ts` routes to mock data when enabled

**Dev Auth Bypass:**
- `VITE_DEV_BYPASS_AUTH=true` enables mock authentication
- Sets fake tokens in localStorage (`src/components/Login.tsx`)

## Coverage

**Requirements:**
- No coverage targets
- No coverage tooling

## Test Types

**Unit Tests:**
- Not implemented
- Priority areas: ApiService data transformations (`src/services/api.ts`), SearchService query routing (`src/services/searchService.ts`), utility functions (`src/utils/statusUtils.ts`)

**Integration Tests:**
- Not implemented
- Priority areas: Auth flow, search-to-detail flow

**E2E Tests:**
- Not implemented

## Recommended Setup (for future implementation)

**Framework:** Vitest (recommended for Vite projects)
**Component Testing:** @testing-library/react
**Test Location:** Co-located with source (`Component.tsx` + `Component.test.tsx`)
**Priority Test Targets:**
1. `src/services/api.ts` - Data transformation functions (BackendVendor -> Retailer, BackendUser -> User)
2. `src/services/searchService.ts` - Search routing logic
3. `src/utils/statusUtils.ts` - Pure utility functions
4. `src/components/Login.tsx` - Auth flow
5. `src/components/SearchBar.tsx` - Search input behavior

---

*Testing analysis: 2026-02-09*
*Update when test patterns change*
