import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sortable column header for use with DataTable.
 *
 * Renders as a plain clickable span so it sits at the same visual size
 * as non-sortable headers (which are just strings in the column def).
 * Clicking cycles: unsorted -> ascending -> descending -> unsorted.
 */

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  function handleToggleSort() {
    if (sorted === false) {
      column.toggleSorting(false); // asc
    } else if (sorted === "asc") {
      column.toggleSorting(true); // desc
    } else {
      column.clearSorting(); // unsorted
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggleSort}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer",
        className,
      )}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="size-3" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3" />
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  );
}
