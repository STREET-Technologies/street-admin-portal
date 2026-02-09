import { useCallback, useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { SortingState, OnChangeFn } from "@tanstack/react-table";

/**
 * Syncs TanStack Table pagination + sorting state with URL search params
 * via TanStack Router. Users can bookmark filtered/sorted/paged views.
 *
 * URL params: ?page=1&limit=20&sortBy=name&sortOrder=asc
 *
 * Usage:
 * ```ts
 * const { pagination, sorting, onPaginationChange, onSortingChange } =
 *   useTableParams({ pageSize: 20, sortBy: "createdAt", sortOrder: "desc" });
 * ```
 */

interface TableParamsDefaults {
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface SearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
  const { pageSize: defaultPageSize = 20, sortBy: defaultSortBy, sortOrder: defaultSortOrder } = defaults;

  // Read current search params from URL (strict: false = works from any route)
  const search = useSearch({ strict: false }) as SearchParams;
  const navigate = useNavigate();

  const page = search.page ?? 1;
  const limit = search.limit ?? defaultPageSize;
  const sortBy = search.sortBy ?? defaultSortBy;
  const sortOrder = search.sortOrder ?? defaultSortOrder;

  const pagination = useMemo(
    () => ({ pageIndex: page - 1, pageSize: limit }),
    [page, limit],
  );

  const sorting: SortingState = useMemo(
    () =>
      sortBy
        ? [{ id: sortBy, desc: sortOrder === "desc" }]
        : [],
    [sortBy, sortOrder],
  );

  const onPaginationChange = useCallback(
    (next: { pageIndex: number; pageSize: number }) => {
      void navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          page: next.pageIndex + 1,
          limit: next.pageSize,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const nextSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      const nextSort = nextSorting[0];

      void navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          page: 1,
          sortBy: nextSort?.id,
          sortOrder: nextSort ? (nextSort.desc ? "desc" : "asc") : undefined,
        }),
        replace: true,
      });
    },
    [navigate, sorting],
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
