import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useTableParams } from "@/hooks/use-table-params";
import { useRetailerBillingQuery } from "../api/retailer-queries";
import type { RetailerBillingLedgerEntry } from "../api/retailer-api";

interface RetailerBillingTabProps {
  retailerId: string;
}

function BillingStatusBadge({
  status,
}: {
  status: RetailerBillingLedgerEntry["billingStatus"];
}) {
  if (status === "charged")
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Charged
      </Badge>
    );
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (status === "pending")
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Pending
      </Badge>
    );
  return <Badge variant="secondary">Skipped</Badge>;
}

/**
 * The arithmetic behind the charge, from the order's own pricingBreakdown
 * snapshot: commission on the product total, plus the delivery recovery fee,
 * less any STREET-absorbed discount.
 */
function ChargeWorkings({ entry }: { entry: RetailerBillingLedgerEntry }) {
  if (entry.commissionAmount === null) {
    return (
      <span className="text-xs text-muted-foreground">
        No pricing breakdown recorded
      </span>
    );
  }

  // Collapsed by default (TT-446): the arithmetic matters when a figure is
  // being questioned, not on every row of a 25-row page. The summary line
  // carries the commission, which is the part usually being scanned for.
  return (
    <Collapsible>
      <CollapsibleTrigger className="group/workings flex items-center gap-1 text-left text-xs text-muted-foreground hover:text-foreground">
        <ChevronRight className="size-3 shrink-0 transition-transform group-data-[state=open]/workings:rotate-90" />
        <span className="tabular-nums">
          {formatCurrency(entry.commissionAmount)} commission
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pl-4 text-xs text-muted-foreground tabular-nums">
        {formatCurrency(entry.productTotal)}
        {entry.commissionPercentage !== null &&
          ` × ${entry.commissionPercentage}%`}{" "}
        = {formatCurrency(entry.commissionAmount)}
        {entry.expectedDeliveryFee !== null &&
          ` + ${formatCurrency(entry.expectedDeliveryFee)} delivery`}
        {entry.discountAbsorbed
          ? ` − ${formatCurrency(entry.discountAbsorbed)} STREET credit`
          : ""}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SubscriptionStatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;
  const upper = status.toUpperCase();
  if (upper === "ACTIVE")
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Active
      </Badge>
    );
  if (upper === "CANCELLED")
    return <Badge variant="destructive">Cancelled</Badge>;
  if (upper === "PENDING") return <Badge variant="secondary">Pending</Badge>;
  if (upper === "DECLINED")
    return <Badge variant="destructive">Declined</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

/**
 * Where the cap bar changes colour. Marks are drawn at these positions so the
 * threshold is readable from position as well as hue — green/amber/red is the
 * hardest trio for colour vision deficiency, and this bar is the one place the
 * portal leans on it.
 */
const CAP_THRESHOLDS = [70, 90] as const;

/**
 * The four billing statuses, with support-facing copy. Only `failed` is ever
 * a fault — `skipped` is the normal resting state for an order that was
 * cancelled, missed or abandoned, and reads as a problem without this.
 */
const BILLING_STATUSES: {
  key: RetailerBillingLedgerEntry["billingStatus"];
  label: string;
  icon: React.ElementType;
  description: string;
  tone?: "warn" | "danger";
}[] = [
  {
    key: "charged",
    label: "Charged",
    icon: CheckCircle,
    description: "Commission billed on delivery.",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    description: "Not yet delivered. Charges on delivery.",
    tone: "warn",
  },
  {
    key: "failed",
    label: "Failed",
    icon: XCircle,
    description: "Charge attempt failed. Needs a look.",
    tone: "danger",
  },
  {
    key: "skipped",
    label: "Skipped",
    icon: AlertTriangle,
    description: "Never chargeable. Cancelled or missed — expected.",
  },
];

/**
 * `billingError` sometimes holds a raw Shopify cancel token rather than prose
 * — "inventory" on its own tells support nothing. Translate the known tokens
 * and leave anything else (already a sentence) as written.
 */
const REASON_TEXT: Record<string, string> = {
  inventory: "Retailer cancelled — item out of stock",
  customer: "Cancelled at the customer's request",
  declined: "Payment was declined",
  fraud: "Cancelled as suspected fraud",
  other: "Cancelled — no reason given",
};

function readableReason(reason: string | null): string | null {
  if (!reason) return null;
  return REASON_TEXT[reason.trim().toLowerCase()] ?? reason;
}

/** Fallback context when an order carries no reason of its own. */
const ORDER_STATUS_TEXT: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  AWAITING_ACCEPTANCE: "Awaiting retailer acceptance",
  CONFIRMED: "Accepted, not yet delivered",
  READY_FOR_DELIVERY: "Ready for the courier",
  IN_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Order cancelled",
  PAYMENT_CANCELLED: "Cancelled before payment completed",
  PAYMENT_FAILED: "Payment failed",
  MISSED: "Retailer never accepted",
  REJECTED: "Retailer rejected the order",
  RETURNING: "Being returned",
  RETURNED: "Returned",
};

function StatTile({
  icon: Icon,
  label,
  value,
  description,
  tone,
  selected,
  onSelect,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  tone?: "warn" | "danger";
  selected: boolean;
  onSelect: () => void;
}) {
  // Tone only fires when the bucket is non-empty — a zero Failed count is
  // good news and should not be painted red.
  const iconClass =
    value > 0 && tone === "danger"
      ? "text-red-500"
      : value > 0 && tone === "warn"
        ? "text-yellow-500"
        : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "border-primary bg-muted/50 ring-1 ring-primary" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`size-3.5 shrink-0 ${iconClass}`} />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="ml-auto text-lg font-semibold leading-none tabular-nums">
          {value}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
        {description}
      </p>
    </button>
  );
}

export function RetailerBillingTab({ retailerId }: RetailerBillingTabProps) {
  const [statusFilter, setStatusFilter] = useState<
    RetailerBillingLedgerEntry["billingStatus"] | null
  >(null);
  // Prefixed so the ledger's paging does not collide with the Orders tab's
  // on the same route (TT-445).
  const { pagination, onPaginationChange, searchParams } = useTableParams({
    prefix: "billing",
  });
  const { data, isLoading, isError, refetch, isFetching } =
    useRetailerBillingQuery(
      retailerId,
      statusFilter,
      searchParams.page,
      searchParams.limit,
    );

  if (isLoading) return <LoadingState variant="page" />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load billing data"
        message="There was a problem fetching billing information for this retailer."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No billing data"
        description="No billing information is available for this retailer yet."
      />
    );
  }

  // Changing the filter changes the row set, so page 2 of the old filter is
  // meaningless against the new one — always land back on page 1.
  const resetToFirstPage = () =>
    onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });

  const toggleFilter = (
    status: RetailerBillingLedgerEntry["billingStatus"],
  ) => {
    setStatusFilter((current) => (current === status ? null : status));
    resetToFirstPage();
  };

  const clearFilter = () => {
    setStatusFilter(null);
    resetToFirstPage();
  };

  // Filtered and paginated server-side.
  const visibleLedger = data.ledger;
  const { total: pageTotal } = data.ledgerPage;

  const capPercent =
    data.subscription && data.subscription.cappedAmount > 0
      ? Math.min(
          100,
          (data.orders.chargedAmount / data.subscription.cappedAmount) * 100,
        )
      : null;

  return (
    <div className="space-y-8">
      {/* Shopify subscription — flat section */}
      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold leading-none">
          <CreditCard className="size-4" />
          Shopify Billing Subscription
        </h2>
        <div className="mt-4 border-t pt-5">
          {!data.subscription ? (
            <p className="text-sm text-muted-foreground">
              {data.shopDomain
                ? "Could not retrieve subscription data from Shopify app — it may be offline."
                : "This retailer has no Shopify shop linked."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <SubscriptionStatusBadge status={data.subscription.status} />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Shop domain
                </p>
                <p className="text-sm font-medium">{data.shopDomain ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Spending cap
                </p>
                <p className="text-sm font-medium tabular-nums">
                  {formatCurrency(
                    data.subscription.cappedAmount,
                    data.subscription.billingCurrency,
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Currency
                </p>
                <p className="text-sm font-medium">
                  {data.subscription.billingCurrency ?? "—"}
                </p>
              </div>
              {capPercent !== null && (
                <div className="col-span-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Cap consumed (
                      {formatCurrency(
                        data.orders.chargedAmount,
                        data.subscription!.billingCurrency,
                      )}{" "}
                      of{" "}
                      {formatCurrency(
                        data.subscription!.cappedAmount,
                        data.subscription!.billingCurrency,
                      )}
                      )
                    </span>
                    <span className="tabular-nums">
                      {capPercent.toFixed(1)}%
                    </span>
                  </div>
                  {/* Shared Progress rather than a hand-rolled pair of divs
                      (TT-446). The indicator keeps the threshold colours:
                      approaching the cap is the whole point of the bar.
                      The 70/90 marks give position as a second channel, so
                      the thresholds do not rely on telling green from amber
                      from red. They sit at fixed percentages because the
                      track is normalised against the cap — a retailer
                      changing their cap in Shopify moves the fill, never
                      the marks. */}
                  <div className="relative">
                    <Progress
                      value={capPercent}
                      aria-label="Spending cap consumed"
                      indicatorClassName={
                        capPercent >= 90
                          ? "bg-red-500"
                          : capPercent >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }
                    />
                    {CAP_THRESHOLDS.map((threshold) => (
                      <span
                        key={threshold}
                        aria-hidden
                        title={`${threshold}% of cap`}
                        className="absolute top-0 h-2 w-px bg-background/80"
                        style={{ left: `${threshold}%` }}
                      />
                    ))}
                  </div>
                  <div className="relative h-3 text-[11px] text-muted-foreground">
                    {CAP_THRESHOLDS.map((threshold) => (
                      <span
                        key={threshold}
                        className="absolute -translate-x-1/2 tabular-nums"
                        style={{ left: `${threshold}%` }}
                      >
                        {threshold}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Order billing stats — flat section, doubles as the ledger filter */}
      <section>
        <h2 className="text-base font-semibold leading-none">
          Order Billing Breakdown
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Select a status to filter the ledger below.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-5 sm:grid-cols-4">
          {BILLING_STATUSES.map((status) => (
            <StatTile
              key={status.key}
              icon={status.icon}
              label={status.label}
              value={data.orders[status.key]}
              description={status.description}
              tone={status.tone}
              selected={statusFilter === status.key}
              onSelect={() => toggleFilter(status.key)}
            />
          ))}
        </div>
      </section>

      {/* Per-order charge ledger — flat section */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold capitalize leading-none">
            {statusFilter ? `Charge Ledger — ${statusFilter}` : "Charge Ledger"}
          </h2>
          {statusFilter && (
            <button
              type="button"
              onClick={clearFilter}
              className="text-xs text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {/* Row counts and page position come from TablePagination below. */}
          Expected is derived from the order's pricing snapshot; charged is what
          Shopify was billed.
        </p>
        <div className={`mt-4 border-t pt-5 ${isFetching ? "opacity-60" : ""}`}>
          {visibleLedger.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {pageTotal > 0
                ? "No orders on this page."
                : statusFilter
                  ? `No ${statusFilter} orders.`
                  : "No orders to bill yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Breakdown</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Charged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLedger.map((entry) => {
                  const mismatch =
                    entry.billingAmount !== null &&
                    entry.expectedCharge !== null &&
                    Math.abs(entry.billingAmount - entry.expectedCharge) > 0.01;

                  // A Shopify usage record proves money was billed, whatever
                  // the billing status now says. Without this the row reads
                  // as "never chargeable" on an order that was charged.
                  const billedThenSkipped =
                    entry.billingStatus === "skipped" &&
                    Boolean(entry.billingUsageRecordId);

                  // Cancelling an order the customer already paid for refunds
                  // them in Shopify (TT-418) — worth stating outright, since
                  // the retailer was still charged commission on it.
                  const customerRefunded =
                    entry.orderStatus === "CANCELLED" &&
                    entry.paymentStatus === "PAID";

                  return (
                    <TableRow key={entry.orderId}>
                      <TableCell className="align-top">
                        <Link
                          to="/orders/$orderId"
                          params={{ orderId: entry.orderId }}
                          className="font-mono text-xs font-medium text-primary hover:underline"
                        >
                          {entry.orderId}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="align-top">
                        <BillingStatusBadge status={entry.billingStatus} />
                        <p className="mt-1 max-w-[18rem] text-xs text-muted-foreground">
                          {readableReason(entry.billingError) ??
                            entry.statusReason ??
                            ORDER_STATUS_TEXT[entry.orderStatus] ??
                            entry.orderStatus}
                          {customerRefunded && " · Customer refunded"}
                        </p>
                        {billedThenSkipped && (
                          <p className="mt-1 max-w-[18rem] text-xs text-yellow-600">
                            Charged before the order was cancelled. The
                            commission was not reversed.
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <ChargeWorkings entry={entry} />
                      </TableCell>
                      <TableCell className="align-top text-right text-sm tabular-nums">
                        {entry.expectedCharge === null
                          ? "—"
                          : formatCurrency(entry.expectedCharge)}
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <span
                          className={`text-sm font-medium tabular-nums ${
                            mismatch ? "text-yellow-600" : ""
                          }`}
                        >
                          {entry.billingAmount === null
                            ? "—"
                            : formatCurrency(entry.billingAmount)}
                        </span>
                        {mismatch && (
                          <p className="mt-0.5 text-xs text-yellow-600">
                            Differs from expected
                          </p>
                        )}
                        {entry.billingChargedAt && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(entry.billingChargedAt)}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 border-t pt-3">
            <TablePagination
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              total={pageTotal}
              onPaginationChange={onPaginationChange}
              isFetching={isFetching}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
