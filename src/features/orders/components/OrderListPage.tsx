import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, ShoppingCart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { RetailerFilter } from "@/components/shared/RetailerFilter";
import { OutletFilter } from "@/components/shared/OutletFilter";
import { useTableParams } from "@/hooks/use-table-params";
import { useSearchParamState } from "@/hooks/use-search-param";
import { useTabParam } from "@/hooks/use-tab-param";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/lib/format-utils";
import { useOrdersQuery } from "../api/order-queries";
import { OrderPeekSheet } from "./OrderPeekSheet";
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

function tabToQueryParams(tab: TabKey): {
  status?: string;
  stuck?: boolean;
  returnStatus?: string;
} {
  switch (tab) {
    case "all":
      return {};
    case "new":
      return { status: "PENDING,AWAITING_ACCEPTANCE,PENDING_PAYMENT" };
    case "in-progress":
      return {
        status:
          "CONFIRMED,IN_PACKING,READY_FOR_DELIVERY,WAITING_FOR_PICKUP,IN_DELIVERY,SHIPPED,RETURNING",
      };
    case "stuck":
      return { stuck: true };
    case "declined":
      return { status: "REJECTED,MISSED" };
    case "delivered":
      return { status: "DELIVERED,COMPLETED" };
    case "returned":
      // TT-226 — any order with a non-terminal-cancelled return state, OR'd
      // (TT-115) with the Stuart return-to-store order statuses — backend
      // combines status + returnStatus with OR when both are present.
      return {
        returnStatus: "REQUESTED,IN_PROGRESS,PARTIAL,COMPLETE",
        status: "RETURNING,RETURNED",
      };
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
  onPeek: (order: OrderViewModel) => void,
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
      cell: ({ row }) => (
        <div>
          {row.original.retailerId ? (
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
          )}
          {/* Branch under the brand (TT-449) — a multi-outlet retailer was
              otherwise indistinguishable without opening each order. Sits in
              this column rather than a ninth one; the table is dense enough. */}
          {row.original.outletName && (
            <p className="text-xs text-muted-foreground">
              {row.original.outletName}
            </p>
          )}
        </div>
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
        if (attempts === 0)
          return <span className="text-xs text-muted-foreground">—</span>;
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
        <span className="text-sm font-medium tabular-nums">
          {row.original.totalAmount}
        </span>
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
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <OrderRowActions
          order={row.original}
          onPeek={() => onPeek(row.original)}
          onOpen={() => onRowClick(row.original.orderId)}
        />
      ),
    },
  ];
}

/**
 * Row-level actions (TT-446). Destructive actions deliberately stay out of
 * here: cancel and refund require a written reason, so they live in the peek
 * panel and the detail page where that dialog is. This menu is for getting
 * to the order and lifting identifiers out of it.
 */
function OrderRowActions({
  order,
  onPeek,
  onOpen,
}: {
  order: OrderViewModel;
  onPeek: () => void;
  onOpen: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for order ${order.orderId}`}
          // The row itself opens the peek; without this the menu click would
          // trigger that too and the panel would fight the dropdown.
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={onPeek}>Quick view</DropdownMenuItem>
        <DropdownMenuItem onSelect={onOpen}>Open full page</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void navigator.clipboard.writeText(order.orderId)}
        >
          Copy order ID
        </DropdownMenuItem>
        {order.customerEmail && (
          <DropdownMenuItem
            onSelect={() =>
              void navigator.clipboard.writeText(order.customerEmail)
            }
          >
            Copy customer email
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderListPage() {
  const navigate = useNavigate();
  const {
    pagination,
    sorting,
    onPaginationChange,
    onSortingChange,
    searchParams,
  } = useTableParams({ sortBy: "createdAt", sortOrder: "desc" });

  // Filter state. The tab lives in ?tab= so the dashboard (and bookmarks)
  // can deep-link straight into a bucket like /orders?tab=stuck (TT-358).
  const [searchValue, setSearchValue] = useState("");
  const [tabParam, setTabParam] = useTabParam("all");
  const tabFilter = (
    ORDER_TABS.some((t) => t.value === tabParam) ? tabParam : "all"
  ) as TabKey;
  const setTabFilter = setTabParam;
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchValue, 300);
  // Read straight from the URL — DateRangeFilter owns writing them (TT-447).
  const [dateFrom] = useSearchParamState("dateFrom");
  const [dateTo] = useSearchParamState("dateTo");
  const [vendorId, setVendorId] = useSearchParamState("vendorId");
  const [outletId, setOutletId] = useSearchParamState("outletId");

  const resetToFirstPage = () =>
    onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });

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
    paymentMethod:
      paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    dateFrom,
    dateTo,
    vendorId,
    outletId,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const orders = orderData?.data ?? [];
  const totalPages = orderData?.meta?.totalPages ?? 0;

  // The row the peek panel is showing. Holds the list row itself so the panel
  // opens populated rather than waiting on the detail fetch.
  const [peekOrder, setPeekOrder] = useState<OrderViewModel | null>(null);

  const columns = useMemo(
    () =>
      createColumns(
        (orderId) => {
          void navigate({ to: "/orders/$orderId", params: { orderId } });
        },
        (order) => setPeekOrder(order),
      ),
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
      <Tabs value={tabFilter} onValueChange={(v) => setTabFilter(v as TabKey)}>
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
        <Select
          value={paymentMethodFilter}
          onValueChange={setPaymentMethodFilter}
        >
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

        {/* Retailer (TT-448). Composes with the tabs, search and dates —
            the retailer's own Orders tab drops all three. */}
        <RetailerFilter
          value={vendorId}
          onChange={(next) => {
            setVendorId(next);
            // An outlet belongs to exactly one retailer, so carrying the old
            // selection across would filter on a branch the new retailer does
            // not own and return nothing — reading as a bug, not a filter.
            setOutletId(undefined);
            resetToFirstPage();
          }}
        />

        {/* Only appears once a retailer with more than one branch is picked
            (TT-450). */}
        <OutletFilter
          retailerId={vendorId}
          value={outletId}
          onChange={(next) => {
            setOutletId(next);
            resetToFirstPage();
          }}
        />

        {/* Changing the range changes the result set, so page 3 of the old
            range is meaningless against the new one. */}
        <DateRangeFilter onChange={resetToFirstPage} />
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={orders}
        pageCount={totalPages}
        totalItems={orderData?.meta?.total}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isLoading}
        emptyMessage="No orders found"
        emptyIcon={ShoppingCart}
        // Row background opens the peek; the Order ID cell still navigates to
        // the full page, so both routes exist without a modifier key (TT-446).
        onRowClick={(order) => setPeekOrder(order)}
      />

      <OrderPeekSheet
        order={peekOrder}
        onOpenChange={(open) => {
          if (!open) setPeekOrder(null);
        }}
      />
    </div>
  );
}
