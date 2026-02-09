import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sortable column header for use with DataTable.
 *
 * Clicking cycles through: unsorted -> ascending -> descending -> unsorted.
 * Displays the appropriate arrow icon for the current sort direction.
 * Non-sortable columns render as plain text.
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
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8", className)}
      onClick={handleToggleSort}
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="ml-1 size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-1 size-3.5" />
      ) : (
        <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground" />
      )}
    </Button>
  );
}
