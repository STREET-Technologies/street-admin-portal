import { Undo2 } from "lucide-react";
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
          <li key={event.id} className="py-2">
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

function RefundRow({
  event,
}: {
  event: Extract<RefundEvent, { kind: "refund" }>;
}) {
  return (
    <div className="flex items-baseline gap-x-4">
      <p className="min-w-0 flex-1 truncate text-sm" title={eventTitle(event)}>
        <When date={event.date} />
        <span className="font-medium">Refund</span>
        <Reason reason={event.reason} />
        {event.return ? <ReturnInline ret={event.return} /> : null}
        {event.shippingFormatted ? (
          <span className="text-muted-foreground">
            {" · "}incl. {event.shippingFormatted} shipping (not recoverable by
            retailer)
          </span>
        ) : null}
      </p>
      <span className="shrink-0 text-sm font-semibold tabular-nums">
        −{event.amountFormatted}
      </span>
    </div>
  );
}

function ReturnRow({
  event,
}: {
  event: Extract<RefundEvent, { kind: "return" }>;
}) {
  return (
    <div className="flex items-baseline gap-x-4">
      <p className="min-w-0 flex-1 truncate text-sm" title={eventTitle(event)}>
        <When date={event.date} />
        <span className="font-medium">Return</span>
        <span className="text-muted-foreground">
          {" "}
          {humanize(event.return.status).toLowerCase()}
        </span>
        <ReturnInline ret={event.return} />
      </p>
      <span className="shrink-0 text-xs text-muted-foreground">
        Not refunded yet
      </span>
    </div>
  );
}

function When({ date }: { date: string }) {
  return (
    <span className="text-muted-foreground tabular-nums">
      {formatDateTime(date)}
      {" · "}
    </span>
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
    return <span className="text-muted-foreground"> · No reason recorded</span>;
  }
  const label = reason.source === "customer" ? "Customer return" : "Retailer";
  return (
    <>
      <span className="text-muted-foreground"> · {label}</span>
      {reason.text ? <>: {reason.text}</> : null}
    </>
  );
}

/** Return ref, items and customer note, inline. */
function ReturnInline({ ret }: { ret: ReturnSummary }) {
  return (
    <>
      <span className="text-muted-foreground">
        {" · "}
        <span className="font-mono">#{ret.shopifyReturnId}</span>
      </span>
      {ret.lineItems.map((line) => (
        <span key={line.id}>
          {" · "}
          {line.quantity}× {line.productName}
          {line.condition && line.condition.toUpperCase() !== "UNKNOWN" ? (
            <span className="text-muted-foreground">
              {" "}
              ({humanize(line.condition).toLowerCase()})
            </span>
          ) : null}
        </span>
      ))}
      {ret.customerNote ? (
        <span className="italic text-muted-foreground">
          {" · “"}
          {ret.customerNote}
          {"”"}
        </span>
      ) : null}
    </>
  );
}

/** Full text for the hover title, since the row truncates. */
function eventTitle(event: RefundEvent): string {
  const parts: string[] = [formatDateTime(event.date)];
  if (event.kind === "refund") {
    parts.push("Refund");
    if (event.reason) {
      parts.push(
        `${event.reason.source === "customer" ? "Customer return" : "Retailer"}${event.reason.text ? `: ${event.reason.text}` : ""}`,
      );
    } else {
      parts.push("No reason recorded");
    }
    if (event.shippingFormatted)
      parts.push(`incl. ${event.shippingFormatted} shipping`);
  } else {
    parts.push(`Return ${humanize(event.return.status).toLowerCase()}`);
  }
  const ret = event.return;
  if (ret) {
    parts.push(`#${ret.shopifyReturnId}`);
    for (const line of ret.lineItems)
      parts.push(`${line.quantity}× ${line.productName}`);
    if (ret.customerNote) parts.push(`“${ret.customerNote}”`);
  }
  return parts.join(" · ");
}
