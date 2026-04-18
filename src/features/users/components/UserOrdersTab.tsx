import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
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
import { formatDate, formatCurrency } from "@/lib/format-utils";
import { useUserOrdersQuery } from "../api/user-queries";
import type { BackendUserOrder } from "../types";

interface UserOrdersTabProps {
  userId: string;
}

const columns: ColumnDef<BackendUserOrder>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="group/id flex items-center gap-1">
        <Link
          to="/orders/$orderId"
          params={{ orderId: row.original.orderNumber ?? row.original.id }}
          className="font-mono text-xs font-medium text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.orderNumber ?? row.original.id.slice(0, 8)}
        </Link>
        <span className="opacity-0 transition-opacity group-hover/id:opacity-100">
          <CopyButton value={row.original.id} label="Copy order ID" />
        </span>
      </div>
    ),
  },
  {
    accessorKey: "retailerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Retailer" />
    ),
    cell: ({ row }) =>
      row.original.retailerId ? (
        <Link
          to="/retailers/$retailerId"
          params={{ retailerId: row.original.retailerId }}
          className="text-sm font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.retailerName ?? "Unknown retailer"}
        </Link>
      ) : (
        <span className="text-sm">
          {row.original.retailerName ?? "Unknown retailer"}
        </span>
      ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {formatCurrency(row.original.totalAmount, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];

export function UserOrdersTab({ userId }: UserOrdersTabProps) {
  const { data: orders = [], isLoading, isError, error, refetch } =
    useUserOrdersQuery(userId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <LoadingState variant="table" rows={5} />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load orders"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  if (orders.length === 0) {
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
              className="cursor-pointer"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("button") || target.closest("a")) return;
                void navigate({
                  to: "/orders/$orderId",
                  params: {
                    orderId: row.original.orderNumber ?? row.original.id,
                  },
                });
              }}
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
  );
}
