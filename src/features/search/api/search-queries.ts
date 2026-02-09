import { useQuery } from "@tanstack/react-query";
import { globalSearch } from "./search-api";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const searchKeys = {
  all: ["search"] as const,
  query: (q: string) => [...searchKeys.all, q] as const,
};

// ---------------------------------------------------------------------------
// Query hook
// ---------------------------------------------------------------------------

/**
 * Fires a global search across users, retailers, and orders.
 * Enabled only when query is at least 2 characters.
 * Results are cached for 30 seconds to avoid redundant calls.
 */
export function useGlobalSearchQuery(query: string) {
  return useQuery({
    queryKey: searchKeys.query(query),
    queryFn: () => globalSearch(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
