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
import { Tabs } from "@/components/ui/tabs";
import {
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/shared/UnderlineTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTableParams } from "@/hooks/use-table-params";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/format-utils";
import { useOrdersQuery } from "../api/order-queries";
import type { OrderViewModel } from "../types";

// ---------------------------------------------------------------------------
// Canonical status buckets — map each tab to the backend statuses it covers.
// Backend supports comma-separated `status` and a `stuck` boolean (v5.2.12+).
// ---------------------------------------------------------------------------

type TabKey =
  | "all"
  | "new"
  | "in-progress"
  | "stuck"
  | "declined"
  | "delivered"
  | "returned"
  | "cancelled";

const ORDER_TABS: Array<{ value: TabKey; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in-progress", label: "In Progress" },
  { value: "stuck", label: "Stuck" },
  { value: "declined", label: "Declined" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

function tabToQueryParams(
  tab: TabKey,
): { status?: string; stuck?: boolean; returnStatus?: string } {
  switch (tab) {
    case "all":
      return {};
    case "new":
      return { status: "PENDING,AWAITING_ACCEPTANCE,PENDING_PAYMENT" };
    case "in-progress":
      return {
        status:
          "CONFIRMED,IN_PACKING,READY_FOR_DELIVERY,WAITING_FOR_PICKUP,IN_DELIVERY,SHIPPED",
      };
    case "stuck":
      return { stuck: true };
    case "declined":
      return { status: "REJECTED,MISSED" };
    case "delivered":
      return { status: "DELIVERED,COMPLETED" };
    case "returned":
      // TT-226 — any order with a non-terminal-cancelled return state
      return { returnStatus: "REQUESTED,IN_PROGRESS,PARTIAL,COMPLETE" };
    case "cancelled":
      return { status: "CANCELLED,PAYMENT_FAILED" };
  }
}

const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "shopify_checkout", label: "Shopify Checkout" },
  { value: "others", label: "Others" },
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
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.displayStatus.toLowerCase()}
          size="sm"
        />
      ),
    },
    {
      accessorKey: "reconciliationAttempts",
      header: "Delivery",
      enableSorting: false,
      cell: ({ row }) => {
        // TT-166 — "stuck delivery" indicator. Hidden for healthy orders.
        const attempts = row.original.reconciliationAttempts;
        if (attempts === 0) return <span className="text-xs text-muted-foreground">—</span>;
        const isStuck = attempts >= 12;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider tabular-nums ${
              isStuck
                ? "bg-[hsl(var(--status-stuck-bg))] text-[hsl(var(--status-stuck-fg))]"
                : "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending-fg))]"
            }`}
            title={
              isStuck
                ? `Reconciliation cron gave up (${attempts}/12 attempts) — manual resolve required`
                : `Reconciliation cron is attempting to recover this delivery (${attempts}/12 attempts)`
            }
          >
            {isStuck ? `Stuck ${attempts}/12` : `Reconciling ${attempts}/12`}
          </span>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">{row.original.totalAmount}</span>
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
          {formatDate(row.original.createdAt)}
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
  const [tabFilter, setTabFilter] = useState<TabKey>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchValue, 300);

  const tabParams = tabToQueryParams(tabFilter);

  // Fetch orders from global endpoint with server-side search/filter/pagination
  const {
    data: orderData,
    isLoading,
    isError,
    refetch,
  } = useOrdersQuery({
    search: debouncedSearch || undefined,
    status: tabParams.status,
    stuck: tabParams.stuck,
    returnStatus: tabParams.returnStatus,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
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

      {/* Status tabs — bucket orders by canonical state */}
      <Tabs
        value={tabFilter}
        onValueChange={(v) => setTabFilter(v as TabKey)}
      >
        <UnderlineTabsList>
          {ORDER_TABS.map((tab) => (
            <UnderlineTabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </UnderlineTabsTrigger>
          ))}
        </UnderlineTabsList>
      </Tabs>

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

        {/* Payment method filter */}
        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment type" />
          </SelectTrigger>
          <SelectContent position="popper">
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
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
