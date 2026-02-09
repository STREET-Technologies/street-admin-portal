import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserOrdersQuery } from "../api/user-queries";
import type { BackendUserOrder } from "../types";

interface UserOrdersTabProps {
  userId: string;
}

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount == null) return "--";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency ?? "GBP",
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const columns: ColumnDef<BackendUserOrder, unknown>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="group/id flex items-center gap-1">
        <span className="font-mono text-xs">
          {row.original.orderNumber ?? row.original.id.slice(0, 8)}
        </span>
        <span className="opacity-0 transition-opacity group-hover/id:opacity-100">
          <CopyButton value={row.original.id} label="Copy order ID" />
        </span>
      </div>
    ),
  },
  {
    accessorKey: "retailerName",
    header: "Retailer",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.retailerName ?? "Unknown retailer"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatCurrency(row.original.totalAmount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];

export function UserOrdersTab({ userId }: UserOrdersTabProps) {
  const { data: orders, isLoading, isError, error, refetch } = useUserOrdersQuery(userId);

  // Memoize to avoid unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, []);

  if (isLoading) {
    return <LoadingState variant="table" rows={5} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load orders"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders"
        description="This user has not placed any orders yet."
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {memoizedColumns.map((col) => (
              <TableHead key={String(col.accessorKey ?? col.header)}>
                {typeof col.header === "string" ? col.header : null}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              {memoizedColumns.map((col) => {
                const key = String(col.accessorKey ?? col.header);
                // Render cell using the cell function
                const cellFn = col.cell;
                if (typeof cellFn === "function") {
                  return (
                    <TableCell key={key}>
                      {cellFn({
                        row: { original: order },
                      } as Parameters<typeof cellFn>[0])}
                    </TableCell>
                  );
                }
                return <TableCell key={key}>--</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
