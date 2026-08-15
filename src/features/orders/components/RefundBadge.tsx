import { Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RefundState } from "../types";

interface RefundBadgeProps {
  refundState: RefundState;
  /** Formatted total ("£98.00"); shown after the label when present. */
  totalRefundedFormatted: string | null;
  size?: "sm" | "md";
  className?: string;
}

const LABEL: Record<Exclude<RefundState, "NONE">, string> = {
  PARTIAL: "Partially refunded",
  FULL: "Fully refunded",
};

/**
 * The header-level refund signal (TT-473). Sits on the same line as the
 * status pill so a support person knows in the first second that money went
 * back, without scrolling. Icon + text, never colour-only. Renders nothing
 * when the order has no refunds.
 */
export function RefundBadge({
  refundState,
  totalRefundedFormatted,
  size = "md",
  className,
}: RefundBadgeProps) {
  if (refundState === "NONE") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-50 font-semibold text-amber-900 tabular-nums dark:bg-amber-950/40 dark:text-amber-200",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <Undo2 className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {LABEL[refundState]}
      {totalRefundedFormatted ? ` ${totalRefundedFormatted}` : ""}
    </span>
  );
}
