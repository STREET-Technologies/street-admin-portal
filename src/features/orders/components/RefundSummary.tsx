import { cn } from "@/lib/utils";
import type { RefundState } from "../types";

interface RefundSummaryProps {
  refundState: RefundState;
  totalRefundedFormatted: string | null;
  className?: string;
}

/**
 * The refund signal (TT-473): plain text, on the same line as the status pill
 * so money going back is read in the first second. Deliberately not a pill —
 * pills are reserved for the five status states, and refund is orthogonal to
 * status. Renders nothing when the order has no refunds.
 */
export function RefundSummary({
  refundState,
  totalRefundedFormatted,
  className,
}: RefundSummaryProps) {
  if (refundState === "NONE" || !totalRefundedFormatted) return null;

  return (
    <span className={cn("text-sm font-medium tabular-nums", className)}>
      {refundState === "FULL" ? "Refunded" : "Partially refunded"}{" "}
      {totalRefundedFormatted}
    </span>
  );
}
