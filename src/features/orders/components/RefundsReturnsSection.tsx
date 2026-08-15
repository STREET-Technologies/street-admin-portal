import { Undo2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format-utils";
import { humanize } from "../types";
import type {
  OrderDetailViewModel,
  RefundEvent,
  ReturnSummary,
} from "../types";

interface RefundsReturnsSectionProps {
  orderDetail: OrderDetailViewModel;
}

/**
 * Refunds & returns (TT-473) — one timeline at the top of the order detail.
 * When an order has refunds or returns they are the story of that order for
 * support; the pricing table below is context. One row per event: a refund
 * (amount, date, the reason with its author named, the Return behind it when
 * there is one) or a Return that has not been refunded yet.
 *
 * Renders nothing when there is nothing to tell.
 */
export function RefundsReturnsSection({
  orderDetail,
}: RefundsReturnsSectionProps) {
  if (orderDetail.refundEvents.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-semibold leading-none">
        <Undo2 className="size-4" />
        Refunds & returns
      </h2>
      <ul className="mt-4 divide-y border-t">
        {orderDetail.refundEvents.map((event) => (
          <li key={event.id} className="py-3">
            {event.kind === "refund" ? (
              <RefundRow event={event} />
            ) : (
              <ReturnRow event={event} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RefundRow({ event }: { event: Extract<RefundEvent, { kind: "refund" }> }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">Refund</span>
          <Reason reason={event.reason} />
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(event.date)}
          {event.return ? (
            <>
              {" · "}Return{" "}
              <span className="font-mono">#{event.return.shopifyReturnId}</span>
            </>
          ) : null}
          {event.shippingFormatted ? (
            <>
              {" · "}includes {event.shippingFormatted} shipping, not
              recoverable by the retailer
            </>
          ) : null}
        </p>
        {event.return ? <ReturnDetail ret={event.return} /> : null}
      </div>
      <span className="text-sm font-semibold tabular-nums">
        −{event.amountFormatted}
      </span>
    </div>
  );
}

function ReturnRow({ event }: { event: Extract<RefundEvent, { kind: "return" }> }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Return</span>
          <StatusBadge status={event.return.status} size="sm" />
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(event.date)}
          {" · "}
          <span className="font-mono">#{event.return.shopifyReturnId}</span>
        </p>
        <ReturnDetail ret={event.return} />
      </div>
      <span className="text-xs text-muted-foreground">Not refunded yet</span>
    </div>
  );
}

/**
 * Names the author of the reason. A retailer note and a customer return reason
 * are different sources — never both on one refund — so the label carries the
 * source and the text carries what they said.
 */
function Reason({
  reason,
}: {
  reason: Extract<RefundEvent, { kind: "refund" }>["reason"];
}) {
  if (!reason) {
    return (
      <span className="text-muted-foreground"> · No reason recorded</span>
    );
  }
  const label = reason.source === "customer" ? "Customer return" : "Retailer";
  return (
    <>
      <span className="text-muted-foreground"> · {label}</span>
      {reason.text ? <>: {reason.text}</> : null}
    </>
  );
}

/** Line items and customer note behind a Return. */
function ReturnDetail({ ret }: { ret: ReturnSummary }) {
  if (ret.lineItems.length === 0 && !ret.customerNote) return null;
  return (
    <div className="space-y-0.5 text-xs text-muted-foreground">
      {ret.lineItems.map((line) => (
        <p key={line.id}>
          <span className="text-foreground">
            {line.quantity}× {line.productName}
          </span>
          {line.condition && line.condition.toUpperCase() !== "UNKNOWN"
            ? ` · ${humanize(line.condition)}`
            : ""}
        </p>
      ))}
      {ret.customerNote ? <p className="italic">“{ret.customerNote}”</p> : null}
    </div>
  );
}
