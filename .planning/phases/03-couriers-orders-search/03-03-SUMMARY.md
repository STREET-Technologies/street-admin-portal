# Summary 03-03: Global Search

## Status: Complete

## What was built

- **GlobalSearch component** (`src/features/search/components/GlobalSearch.tsx`): cmdk-based command palette with trigger button in header showing "Search..." + Cmd+K hint. Opens CommandDialog on click or keyboard shortcut. Debounced search (300ms) fires parallel queries to user and vendor admin endpoints. Results grouped by entity type (Users, Retailers, Orders). Selecting a result navigates to the entity detail page.
- **Search API aggregator** (`src/features/search/api/search-api.ts`): Fires `getUsers` and `getRetailers` in parallel via `Promise.allSettled`. Transforms results to `SearchResultItem` format. Detects ST-XXXXX order ID pattern client-side for direct order navigation.
- **Search query hook** (`src/features/search/api/search-queries.ts`): TanStack Query hook with key factory, enabled when query >= 2 chars, 30s staleTime.
- **Header integration** (`src/app/layout/AppLayout.tsx`): GlobalSearch added between breadcrumbs and theme toggle.

## Deviations

None.

## Commits

- `88e1fd7` feat(03-03): create global search API aggregator
- `f18bca8` feat(03-03): create global search with cmdk command palette and Cmd+K shortcut
