import { AlertTriangle, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { OrderDetailViewModel, ReturnViewModel } from "../types";

interface ReturnsCardProps {
  orderDetail: OrderDetailViewModel;
}

/**
 * Returns + refunds card (TT-226).
 *
 * Surfaces:
 * - Order-level returnStatus chip
 * - Each Return with line items, refund totals, and a shipping-refund warning
 *   when shipping was refunded — retailer absorbs the Stuart leg as STREET has
 *   already recovered it via Shopify Billing. See [[shipping-passthrough-economics]].
 */
export function ReturnsCard({ orderDetail }: ReturnsCardProps) {
  const hasReturns = orderDetail.returns.length > 0;
  const hasShippingRefund = orderDetail.totalShippingRefundedAmount > 0;

  if (!hasReturns && !hasShippingRefund) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <RotateCcw className="size-4" />
            Returns &amp; refunds
          </span>
          <StatusBadge status={orderDetail.returnStatus} size="sm" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasShippingRefund ? (
          <ShippingRefundWarning
            amount={orderDetail.totalShippingRefundedFormatted ?? ""}
          />
        ) : null}

        {orderDetail.returns.length > 0 ? (
          <ul className="space-y-4">
            {orderDetail.returns.map((ret) => (
              <li key={ret.id}>
                <ReturnEntry returnItem={ret} orderItems={orderDetail.items} />
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ShippingRefundWarning({ amount }: { amount: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border border-amber-200/60 bg-amber-50 px-3 py-2.5",
        "dark:border-amber-500/30 dark:bg-amber-500/10",
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="text-sm">
        <div className="font-semibold text-amber-900 dark:text-amber-200">
          Shipping refunded — retailer absorbed {amount}
        </div>
        <div className="text-amber-800/80 dark:text-amber-200/70">
          The Stuart delivery leg was paid by STREET and recovered via Shopify
          Billing before the refund. Retailer cannot recover this amount.
        </div>
      </div>
    </div>
  );
}

function ReturnEntry({
  returnItem,
  orderItems,
}: {
  returnItem: ReturnViewModel;
  orderItems: OrderDetailViewModel["items"];
}) {
  const itemsById = new Map(orderItems.map((i) => [i.id, i]));

  return (
    <div className="rounded-md border bg-card/50 px-4 py-3 space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            #{returnItem.shopifyReturnId}
          </span>
          <StatusBadge status={returnItem.status} size="sm" />
        </div>
        <span className="text-sm tabular-nums font-semibold">
          {returnItem.refundedAmountFormatted}
        </span>
      </header>

      {returnItem.lineItems.length > 0 ? (
        <ul className="space-y-1.5 text-sm">
          {returnItem.lineItems.map((line) => {
            const item = line.orderItemId
              ? itemsById.get(line.orderItemId)
              : null;
            const label = item?.productName ?? `Item ${line.orderItemId ?? ""}`;
            const variant = item?.variant && item.variant !== "--" ? ` · ${item.variant}` : "";
            return (
              <li key={line.id} className="flex justify-between gap-3">
                <span className="text-foreground/90">
                  {label}
                  {variant}
                </span>
                <span className="text-muted-foreground shrink-0">
                  qty {line.quantity} · {formatReason(line.reason)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No line items recorded.</p>
      )}

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Opened {formatDate(returnItem.createdAt)}</span>
        {returnItem.closedAt ? (
          <span>Closed {formatDate(returnItem.closedAt)}</span>
        ) : null}
        {returnItem.shippingRefundAmountFormatted ? (
          <span className="text-amber-700 dark:text-amber-300">
            Shipping refund on this return:{" "}
            {returnItem.shippingRefundAmountFormatted}
          </span>
        ) : null}
      </footer>

      {returnItem.customerNote ? (
        <p className="rounded bg-muted/40 px-2.5 py-1.5 text-xs italic text-muted-foreground">
          “{returnItem.customerNote}”
        </p>
      ) : null}
    </div>
  );
}

function formatReason(reason: string): string {
  return reason.replace(/_/g, " ").toLowerCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
