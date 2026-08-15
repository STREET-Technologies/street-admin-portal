import { Undo2 } from "lucide-react";
import { formatDateTime } from "@/lib/format-utils";
import type { OrderDetailViewModel, RefundViewModel } from "../types";
import { RefundBadge } from "./RefundBadge";

interface RefundHistorySectionProps {
  orderDetail: OrderDetailViewModel;
}

/**
 * Per-refund history (TT-473), placed at the TOP of the order detail: when an
 * order has refunds they are the story of that order for support, and the
 * pricing table below is context. One row per `order_refunds` entry — date,
 * amount, shipping component, and the "why" with its author named.
 *
 * Renders nothing when the order has no refunds.
 */
export function RefundHistorySection({ orderDetail }: RefundHistorySectionProps) {
  if (orderDetail.refunds.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-semibold leading-none">
        <Undo2 className="size-4" />
        Refunds
        <RefundBadge
          refundState={orderDetail.refundState}
          totalRefundedFormatted={orderDetail.totalRefundedFormatted}
          size="sm"
          className="ml-1"
        />
      </h2>
      <ul className="mt-4 divide-y border-t">
        {orderDetail.refunds.map((refund) => (
          <li key={refund.id}>
            <RefundRow refund={refund} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RefundRow({ refund }: { refund: RefundViewModel }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm">
          <RefundReason reason={refund.reason} />
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatDateTime(refund.refundedAt)}
          {refund.shopifyReturnId ? (
            <>
              {" · "}Return{" "}
              <span className="font-mono">#{refund.shopifyReturnId}</span>
            </>
          ) : null}
          {refund.shippingRefundAmountFormatted ? (
            <> · includes shipping {refund.shippingRefundAmountFormatted}</>
          ) : null}
        </p>
      </div>
      <span className="text-sm font-semibold tabular-nums">
        {refund.refundedAmountFormatted}
      </span>
    </div>
  );
}

/**
 * Names the author of the reason. A retailer note and a customer return reason
 * are different sources — never both on one refund — so the label carries the
 * source and the text carries what they said.
 */
function RefundReason({ reason }: { reason: RefundViewModel["reason"] }) {
  if (!reason) {
    return <span className="text-muted-foreground">No reason recorded</span>;
  }
  const label = reason.source === "customer" ? "Customer return" : "Retailer";
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      {reason.text ? (
        <>
          <span className="text-muted-foreground"> · </span>
          <span>{reason.text}</span>
        </>
      ) : null}
    </>
  );
}
