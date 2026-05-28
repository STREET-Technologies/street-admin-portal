import { RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { OrderDetailViewModel, ReturnViewModel } from "../types";

interface ReturnsCardProps {
  orderDetail: OrderDetailViewModel;
}

/**
 * Return event log (TT-226).
 *
 * Slim companion to the inlined return signals on PricingPaymentCard (shipping
 * refund warning + refund amount) and ItemsCard (per-item returned chip).
 * Renders only when the order has at least one Return — provides Shopify
 * return ID, dates, and customer notes for ops reference.
 */
export function ReturnsCard({ orderDetail }: ReturnsCardProps) {
  if (orderDetail.returns.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="size-4" />
          Return history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {orderDetail.returns.map((ret) => (
            <li key={ret.id}>
              <ReturnEventRow returnItem={ret} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ReturnEventRow({ returnItem }: { returnItem: ReturnViewModel }) {
  return (
    <div className="space-y-1.5 rounded-md border bg-card/50 px-3 py-2">
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
        <span>Opened {formatDate(returnItem.createdAt)}</span>
        {returnItem.closedAt ? (
          <span>Closed {formatDate(returnItem.closedAt)}</span>
        ) : null}
      </div>

      {returnItem.customerNote ? (
        <p className="rounded bg-muted/40 px-2 py-1 text-xs italic text-muted-foreground">
          “{returnItem.customerNote}”
        </p>
      ) : null}
    </div>
  );
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
