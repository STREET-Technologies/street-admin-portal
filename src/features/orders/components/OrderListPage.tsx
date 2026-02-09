import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { useTableParams } from "@/hooks/use-table-params";
import { useDebounce } from "@/hooks/use-debounce";
import { useRetailersQuery } from "@/features/retailers/api/retailer-queries";
import { useVendorOrdersQuery } from "../api/order-queries";
import type { OrderViewModel } from "../types";

// ---------------------------------------------------------------------------
// Order status options for filter dropdown
// ---------------------------------------------------------------------------

const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "in_delivery", label: "In Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
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
              onClick={() => onRowClick(order.id)}
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
      cell: ({ row }) => (
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
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const debouncedSearch = useDebounce(searchValue, 300);

  // Fetch all vendors for the vendor selector
  const { data: vendorData, isLoading: vendorsLoading } = useRetailersQuery({
    limit: 100,
  });
  const vendors = vendorData?.data ?? [];

  // Auto-select first vendor once loaded
  const activeVendorId = selectedVendorId || (vendors.length > 0 ? vendors[0].id : "");

  // Fetch orders for the selected vendor
  const {
    data: orderData,
    isLoading: ordersLoading,
    isError,
    refetch,
  } = useVendorOrdersQuery(activeVendorId, {
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const orders = orderData?.data ?? [];
  const totalPages = orderData?.meta
    ? Math.ceil(orderData.meta.total / orderData.meta.limit)
    : 0;

  // Client-side search filter (order ID or customer name)
  const searchFiltered = useMemo(() => {
    if (!debouncedSearch) return orders;
    const lower = debouncedSearch.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderId.toLowerCase().includes(lower) ||
        o.customerName.toLowerCase().includes(lower),
    );
  }, [orders, debouncedSearch]);

  // Client-side status filter
  const statusFiltered = useMemo(() => {
    if (statusFilter === "all") return searchFiltered;
    return searchFiltered.filter((o) => o.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  // Client-side sort (backend may not support sort params)
  const sortedOrders = useMemo(() => {
    if (sorting.length === 0) return statusFiltered;
    const [sort] = sorting;
    const key = sort.id as keyof OrderViewModel;
    return [...statusFiltered].sort((a, b) => {
      // Use raw amount for totalAmount sorting
      if (key === "totalAmount") {
        const aVal = a.totalAmountRaw ?? 0;
        const bVal = b.totalAmountRaw ?? 0;
        return sort.desc ? bVal - aVal : aVal - bVal;
      }
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sort.desc ? -cmp : cmp;
    });
  }, [statusFiltered, sorting]);

  const columns = useMemo(
    () =>
      createColumns((orderId) => {
        void navigate({ to: "/orders/$orderId", params: { orderId } });
      }),
    [navigate],
  );

  const isLoading = vendorsLoading || ordersLoading;

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

  if (!vendorsLoading && vendors.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Orders" description="Track and manage orders" />
        <EmptyState
          icon={ShoppingCart}
          title="No retailers found"
          description="Orders are grouped by retailer. Add a retailer to see their orders."
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
            placeholder="Search by order ID or customer..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Vendor selector */}
        <Select
          value={activeVendorId}
          onValueChange={setSelectedVendorId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select retailer" />
          </SelectTrigger>
          <SelectContent>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        data={sortedOrders}
        pageCount={totalPages}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No orders found"
        emptyIcon={ShoppingCart}
      />
    </div>
  );
}
