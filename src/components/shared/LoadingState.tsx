import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder with variants for different contexts.
 *
 * - `page`  -- full-page skeleton with header and content area
 * - `card`  -- card-shaped skeleton with title bar and content lines
 * - `table` -- table header skeleton with configurable row count
 */

interface LoadingStateProps {
  /** Controls the skeleton layout shape. */
  variant?: "page" | "card" | "table";
  /** Number of skeleton rows (for `card` and `table` variants). */
  rows?: number;
  className?: string;
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header area */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content area */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>

      {/* Body */}
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      {/* Title bar */}
      <Skeleton className="h-5 w-40" />

      {/* Content lines */}
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-lg border">
      {/* Table header */}
      <div className="flex gap-4 border-b p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 border-b p-4 last:border-b-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function LoadingState({
  variant = "card",
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cn(className)}
    >
      {variant === "page" && <PageSkeleton />}
      {variant === "card" && <CardSkeleton rows={rows} />}
      {variant === "table" && <TableSkeleton rows={rows} />}
    </div>
  );
}
