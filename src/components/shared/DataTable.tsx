import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

/**
 * Generic, server-driven data table built on TanStack Table + shadcn Table.
 *
 * All pagination and sorting is manual (server-side). The parent component
 * is responsible for fetching data based on the current pagination/sorting
 * state and passing the results here.
 */

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Total number of pages from the server. */
  pageCount: number;
  /** Current zero-based page index. */
  pageIndex: number;
  /** Number of rows per page. */
  pageSize: number;
  /** Called when the user changes page or page size. */
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  /** Current sort state. */
  sorting: SortingState;
  /** Called when the user toggles a column sort. */
  onSortingChange: OnChangeFn<SortingState>;
  /** Show skeleton rows while data is loading. */
  isLoading?: boolean;
  /** Message shown when data is empty. */
  emptyMessage?: string;
  /** Icon shown on the empty state. */
  emptyIcon?: LucideIcon;
  /** Called when a row is clicked. Skips clicks on buttons/links. */
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading = false,
  emptyMessage = "No results found",
  emptyIcon,
  onRowClick,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChange(next);
    },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  if (isLoading) {
    return <LoadingState variant="table" rows={pageSize > 10 ? 10 : pageSize} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyMessage}
        description="Try adjusting your search or filters."
      />
    );
  }

  const totalRows = pageCount * pageSize;
  const rangeStart = pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={
                  onRowClick
                    ? (e) => {
                        // Don't navigate when clicking interactive elements
                        const target = e.target as HTMLElement;
                        if (target.closest("button") || target.closest("a"))
                          return;
                        onRowClick(row.original);
                      }
                    : undefined
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {rangeStart}-{rangeEnd} of {totalRows}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) =>
                onPaginationChange({ pageIndex: 0, pageSize: Number(value) })
              }
            >
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[4rem] text-center text-sm text-muted-foreground">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
