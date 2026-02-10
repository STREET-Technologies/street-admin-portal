import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTableParams } from "@/hooks/use-table-params";
import { useDebounce } from "@/hooks/use-debounce";
import { useOrdersQuery } from "../api/order-queries";
import type { OrderViewModel } from "../types";

// ---------------------------------------------------------------------------
// Order status options for filter dropdown
// ---------------------------------------------------------------------------

const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "IN_DELIVERY", label: "In Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function createColumns(
  onRowClick: (orderId: string) => void,
): ColumnDef<OrderViewModel, unknown>[] {
  return [
    {
      accessorKey: "orderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="group/id flex items-center gap-1">
            <button
              type="button"
              className="font-mono text-xs font-medium hover:underline"
              onClick={() => onRowClick(order.orderId)}
            >
              {order.orderId}
            </button>
            <span className="opacity-0 transition-opacity group-hover/id:opacity-100">
              <CopyButton value={order.orderId} label="Copy order ID" />
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <span className="text-sm font-medium">{order.customerName}</span>
            {order.customerEmail !== "No email" && (
              <p className="text-xs text-muted-foreground">
                {order.customerEmail}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "retailerName",
      header: "Retailer",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.retailerId ? (
          <Link
            to="/retailers/$retailerId"
            params={{ retailerId: row.original.retailerId }}
            className="text-sm font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.retailerName ?? "--"}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">
            {row.original.retailerName ?? "--"}
          </span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.totalAmount}</span>
      ),
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.totalAmountRaw ?? 0;
        const b = rowB.original.totalAmountRaw ?? 0;
        return a - b;
      },
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.itemCount}
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
          {new Date(row.original.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderListPage() {
  const navigate = useNavigate();
  const { pagination, sorting, onPaginationChange, onSortingChange, searchParams } =
    useTableParams({ pageSize: 20, sortBy: "createdAt", sortOrder: "desc" });

  // Filter state
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchValue, 300);

  // Fetch orders from global endpoint with server-side search/filter/pagination
  const {
    data: orderData,
    isLoading,
    isError,
    refetch,
  } = useOrdersQuery({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const orders = orderData?.data ?? [];
  const totalPages = orderData?.meta
    ? Math.ceil(orderData.meta.total / orderData.meta.limit)
    : 0;

  const columns = useMemo(
    () =>
      createColumns((orderId) => {
        void navigate({ to: "/orders/$orderId", params: { orderId } });
      }),
    [navigate],
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Orders" description="Track and manage orders" />
        <ErrorState
          title="Failed to load orders"
          message="There was a problem fetching orders. Please try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Track and manage orders" />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer name, or email..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={orders}
        pageCount={totalPages}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No orders found"
        emptyIcon={ShoppingCart}
        onRowClick={(order) => {
          void navigate({ to: "/orders/$orderId", params: { orderId: order.orderId } });
        }}
      />
    </div>
  );
}
