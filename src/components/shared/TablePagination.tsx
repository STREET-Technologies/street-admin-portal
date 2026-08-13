import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZE_OPTIONS, toPageCount, toRowRange } from "@/lib/pagination";

interface TablePaginationProps {
  /** Zero-based, matching TanStack Table. */
  pageIndex: number;
  pageSize: number;
  /** Total rows across all pages, for the range text and page count. */
  total: number;
  onPaginationChange: (next: { pageIndex: number; pageSize: number }) => void;
  /** Dims the control mid-fetch so a stale page does not look interactive. */
  isFetching?: boolean;
}

/**
 * The pagination control for every table in the portal (TT-445).
 *
 * Extracted from DataTable so tables that are not built on it — the billing
 * ledger, the order tabs — get the identical control instead of hand-rolling
 * a Previous/Next pair with its own copy of the page sizes.
 */
export function TablePagination({
  pageIndex,
  pageSize,
  total,
  onPaginationChange,
  isFetching = false,
}: TablePaginationProps) {
  const pageCount = toPageCount(total, pageSize);
  const { start, end } = toRowRange(pageIndex, pageSize, total);

  const canPrevious = pageIndex > 0;
  const canNext = pageIndex + 1 < pageCount;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? "No rows" : `Showing ${start}-${end} of ${total}`}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              // Back to the first page: the row at index 30 of a 10-row page
              // is not the row at index 30 of a 25-row one.
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
            onClick={() =>
              onPaginationChange({ pageIndex: pageIndex - 1, pageSize })
            }
            disabled={!canPrevious || isFetching}
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
            onClick={() =>
              onPaginationChange({ pageIndex: pageIndex + 1, pageSize })
            }
            disabled={!canNext || isFetching}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
