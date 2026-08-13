import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { SortingState, OnChangeFn } from "@tanstack/react-table";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

/**
 * Syncs TanStack Table pagination + sorting state with URL search params
 * via TanStack Router. Users can bookmark filtered/sorted/paged views.
 *
 * URL params: ?page=1&limit=25&sortBy=name&sortOrder=asc
 *
 * Page size defaults to DEFAULT_PAGE_SIZE — don't pass `pageSize` unless a
 * table genuinely needs to differ, or it becomes a second definition of
 * something lib/pagination.ts already owns (TT-445).
 *
 * Usage:
 * ```ts
 * const { pagination, sorting, onPaginationChange, onSortingChange } =
 *   useTableParams({ sortBy: "createdAt", sortOrder: "desc" });
 *
 * // Two tables on one route must not share ?page:
 * const billing = useTableParams({ prefix: "billing" }); // ?billingPage=2
 * ```
 */

interface TableParamsDefaults {
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  /**
   * Namespaces the URL params so two tables on one route do not fight over
   * `?page`. The retailer detail page carries both an Orders tab and a
   * Billing tab; without a prefix, paging one moves the other.
   * `prefix: "billing"` gives ?billingPage, ?billingLimit, and so on.
   */
  prefix?: string;
}

type SearchParams = Record<string, unknown>;

/** `page` unprefixed, `billingPage` with prefix "billing". */
function paramName(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}${key[0].toUpperCase()}${key.slice(1)}` : key;
}

interface TableParamsReturn {
  /** Zero-based page index for TanStack Table. */
  pagination: { pageIndex: number; pageSize: number };
  /** Sorting state for TanStack Table. */
  sorting: SortingState;
  /** Handler for pagination changes -- updates URL. */
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  /** Handler for sorting changes -- updates URL. */
  onSortingChange: OnChangeFn<SortingState>;
  /** Raw search params for use in API queries. */
  searchParams: {
    page: number;
    limit: number;
    sortBy: string | undefined;
    sortOrder: "asc" | "desc" | undefined;
  };
}

export function useTableParams(
  defaults: TableParamsDefaults = {},
): TableParamsReturn {
  const {
    pageSize: defaultPageSize = DEFAULT_PAGE_SIZE,
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
    prefix,
  } = defaults;

  // Read current search params from URL (strict: false = works from any route)
  const search = useSearch({ strict: false }) as SearchParams;
  const navigate = useNavigate();
  // The `search` updater type for a route-agnostic navigate (see casts below).
  type NavigateSearch = NonNullable<Parameters<typeof navigate>[0]>["search"];

  const pageKey = paramName(prefix, "page");
  const limitKey = paramName(prefix, "limit");
  const sortByKey = paramName(prefix, "sortBy");
  const sortOrderKey = paramName(prefix, "sortOrder");

  const page = (search[pageKey] as number | undefined) ?? 1;
  const limit = (search[limitKey] as number | undefined) ?? defaultPageSize;
  const sortBy = (search[sortByKey] as string | undefined) ?? defaultSortBy;
  const sortOrder =
    (search[sortOrderKey] as "asc" | "desc" | undefined) ?? defaultSortOrder;

  const pagination = useMemo(
    () => ({ pageIndex: page - 1, pageSize: limit }),
    [page, limit],
  );

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  );

  const onPaginationChange = useCallback(
    (next: { pageIndex: number; pageSize: number }) => {
      // Route-agnostic hook (useSearch strict:false), so we cast past the
      // per-route search typing TanStack Router 1.159 tightened.
      void navigate({
        search: ((prev: SearchParams) => ({
          ...prev,
          [pageKey]: next.pageIndex + 1,
          [limitKey]: next.pageSize,
        })) as NavigateSearch,
        replace: true,
      });
    },
    [navigate, pageKey, limitKey],
  );

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      const nextSort = nextSorting[0];

      void navigate({
        search: ((prev: SearchParams) => ({
          ...prev,
          [pageKey]: 1,
          [sortByKey]: nextSort?.id,
          [sortOrderKey]: nextSort
            ? nextSort.desc
              ? "desc"
              : "asc"
            : undefined,
        })) as NavigateSearch,
        replace: true,
      });
    },
    [navigate, sorting, pageKey, sortByKey, sortOrderKey],
  );

  const searchParams = useMemo(
    () => ({ page, limit, sortBy, sortOrder }),
    [page, limit, sortBy, sortOrder],
  );

  return {
    pagination,
    sorting,
    onPaginationChange,
    onSortingChange,
    searchParams,
  };
}
