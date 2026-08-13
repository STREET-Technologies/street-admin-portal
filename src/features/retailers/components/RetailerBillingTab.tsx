import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CreditCard, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { useRetailerBillingQuery } from "../api/retailer-queries";
import type { RetailerBillingLedgerEntry } from "../api/retailer-api";

interface RetailerBillingTabProps {
  retailerId: string;
}

function BillingStatusBadge({ status }: { status: RetailerBillingLedgerEntry["billingStatus"] }) {
  if (status === "charged")
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Charged</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (status === "pending")
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
  return <Badge variant="secondary">Skipped</Badge>;
}

/**
 * The arithmetic behind the charge, from the order's own pricingBreakdown
 * snapshot: commission on the product total, plus the delivery recovery fee,
 * less any STREET-absorbed discount.
 */
function ChargeWorkings({ entry }: { entry: RetailerBillingLedgerEntry }) {
  if (entry.commissionAmount === null) {
    return <span className="text-xs text-muted-foreground">No pricing breakdown recorded</span>;
  }

  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      {formatCurrency(entry.productTotal)}
      {entry.commissionPercentage !== null && ` × ${entry.commissionPercentage}%`} ={" "}
      {formatCurrency(entry.commissionAmount)} commission
      {entry.expectedDeliveryFee !== null && ` + ${formatCurrency(entry.expectedDeliveryFee)} delivery`}
      {entry.discountAbsorbed
        ? ` − ${formatCurrency(entry.discountAbsorbed)} STREET credit`
        : ""}
    </span>
  );
}

function SubscriptionStatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;
  const upper = status.toUpperCase();
  if (upper === "ACTIVE") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
  if (upper === "CANCELLED") return <Badge variant="destructive">Cancelled</Badge>;
  if (upper === "PENDING") return <Badge variant="secondary">Pending</Badge>;
  if (upper === "DECLINED") return <Badge variant="destructive">Declined</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function StatTile({
  icon: Icon,
  label,
  value,
  highlight,
  selected,
  onSelect,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: "warn" | "danger";
  selected: boolean;
  onSelect: () => void;
}) {
  const iconClass =
    highlight === "danger"
      ? "text-red-500"
      : highlight === "warn"
        ? "text-yellow-500"
        : "text-muted-foreground";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center gap-3 rounded-md border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected ? "border-primary bg-muted/50 ring-1 ring-primary" : ""
      }`}
    >
      <Icon className={`size-5 shrink-0 ${iconClass}`} />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </div>
    </button>
  );
}

export function RetailerBillingTab({ retailerId }: RetailerBillingTabProps) {
  const { data, isLoading, isError, refetch } = useRetailerBillingQuery(retailerId);
  const [statusFilter, setStatusFilter] =
    useState<RetailerBillingLedgerEntry["billingStatus"] | null>(null);

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

  const toggleFilter = (status: RetailerBillingLedgerEntry["billingStatus"]) =>
    setStatusFilter((current) => (current === status ? null : status));

  const visibleLedger = statusFilter
    ? data.ledger.filter((entry) => entry.billingStatus === statusFilter)
    : data.ledger;

  const capPercent =
    data.subscription && data.subscription.cappedAmount > 0
      ? Math.min(
          100,
          ((data.orders.chargedAmount / data.subscription.cappedAmount) * 100),
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
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
                <SubscriptionStatusBadge status={data.subscription.status} />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Shop domain</p>
                <p className="text-sm font-medium">{data.shopDomain ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Spending cap</p>
                <p className="text-sm font-medium tabular-nums">
                  {formatCurrency(data.subscription.cappedAmount, data.subscription.billingCurrency)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Currency</p>
                <p className="text-sm font-medium">{data.subscription.billingCurrency ?? "—"}</p>
              </div>
              {capPercent !== null && (
                <div className="col-span-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cap consumed ({formatCurrency(data.orders.chargedAmount, data.subscription!.billingCurrency)} of {formatCurrency(data.subscription!.cappedAmount, data.subscription!.billingCurrency)})</span>
                    <span className="tabular-nums">{capPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capPercent >= 90
                          ? "bg-red-500"
                          : capPercent >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${capPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Order billing stats — flat section, doubles as the ledger filter */}
      <section>
        <h2 className="text-base font-semibold leading-none">Order Billing Breakdown</h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Select a status to filter the ledger below.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-5 sm:grid-cols-4">
          <StatTile
            icon={CheckCircle}
            label="Charged"
            value={data.orders.charged}
            selected={statusFilter === "charged"}
            onSelect={() => toggleFilter("charged")}
          />
          <StatTile
            icon={Clock}
            label="Pending"
            value={data.orders.pending}
            highlight={data.orders.pending > 0 ? "warn" : undefined}
            selected={statusFilter === "pending"}
            onSelect={() => toggleFilter("pending")}
          />
          <StatTile
            icon={XCircle}
            label="Failed"
            value={data.orders.failed}
            highlight={data.orders.failed > 0 ? "danger" : undefined}
            selected={statusFilter === "failed"}
            onSelect={() => toggleFilter("failed")}
          />
          <StatTile
            icon={AlertTriangle}
            label="Skipped"
            value={data.orders.skipped}
            selected={statusFilter === "skipped"}
            onSelect={() => toggleFilter("skipped")}
          />
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
              onClick={() => setStatusFilter(null)}
              className="text-xs text-primary hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {statusFilter
            ? `Showing ${visibleLedger.length} ${statusFilter} within the ${data.ledger.length} most recent orders (${data.orders[statusFilter]} ${statusFilter} in total).`
            : data.ledgerTotal > data.ledger.length
              ? `Showing the ${data.ledger.length} most recent of ${data.ledgerTotal} orders.`
              : `${data.ledgerTotal} order${data.ledgerTotal === 1 ? "" : "s"}.`}{" "}
          Expected is derived from the order's pricing snapshot; charged is what Shopify was billed.
        </p>
        <div className="mt-4 border-t pt-5">
          {visibleLedger.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {statusFilter
                ? `No ${statusFilter} orders within the ${data.ledger.length} most recent.`
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
                        {entry.billingError && (
                          <p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
                            {entry.billingError}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <ChargeWorkings entry={entry} />
                      </TableCell>
                      <TableCell className="align-top text-right text-sm tabular-nums">
                        {entry.expectedCharge === null ? "—" : formatCurrency(entry.expectedCharge)}
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
        </div>
      </section>
    </div>
  );
}
