import { cn } from "@/lib/utils";

/**
 * Status pill. Uppercase, fill-color hierarchy per DESIGN.md.
 *
 * Five canonical statuses (Stuck > New > Pending > Cancelled > Delivered).
 * Backend statuses are aliased onto these slots — see STATUS_ALIAS below.
 * Unknown values fall back to the Delivered (peripheral) treatment so the
 * UI never breaks on unexpected backend data.
 */

type StatusVariant =
  | "new"
  | "pending"
  | "stuck"
  | "declined"
  | "delivered"
  | "cancelled";

// Tailwind class bundles per canonical variant. Tokens defined in src/index.css.
const VARIANT_CLASSES: Record<StatusVariant, string> = {
  new: "bg-[hsl(var(--status-new-bg))] text-[hsl(var(--status-new-fg))]",
  pending:
    "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending-fg))]",
  stuck: "bg-[hsl(var(--status-stuck-bg))] text-[hsl(var(--status-stuck-fg))]",
  declined:
    "bg-[hsl(var(--status-declined-bg))] text-[hsl(var(--status-declined-fg))]",
  delivered:
    "bg-[hsl(var(--status-delivered-bg))] text-[hsl(var(--status-delivered-fg))]",
  cancelled:
    "bg-[hsl(var(--status-cancelled-bg))] text-[hsl(var(--status-cancelled-fg))] line-through",
};

// Backend status strings → canonical variant.
// Order statuses: see street-backend/src/modules/v1/orders/enums/order-status.enum.ts
const STATUS_ALIAS: Record<string, StatusVariant> = {
  // ─── New / fresh (needs attention) ───
  new: "new",
  pending: "new", // just placed, awaiting retailer / payment
  pending_payment: "new",
  awaiting_acceptance: "new",

  // ─── In-progress pipeline (waiting, no immediate action) ───
  active: "pending",
  paid: "pending",
  confirmed: "pending",
  in_packing: "pending",
  preparing: "pending",
  ready: "pending",
  ready_for_delivery: "pending",
  waiting_for_pickup: "pending",
  in_delivery: "pending",
  shipped: "pending",

  // ─── Urgent — operator action required ───
  stuck: "stuck",
  failed: "stuck",
  blocked: "stuck",

  // ─── Retailer-side failure (declined or timed out) ───
  rejected: "declined",
  declined: "declined",
  missed: "declined",

  // ─── Terminal — done ───
  delivered: "delivered",
  refunded: "delivered",
  completed: "delivered",
  inactive: "delivered",
  suspended: "delivered",

  // ─── Terminal — voided / payment lost ───
  cancelled: "cancelled",
  canceled: "cancelled",
  payment_failed: "cancelled",
  payment_cancelled: "cancelled",

  // ─── Return statuses (TT-226) — orthogonal to order status ───
  requested: "new", // customer/retailer requested, awaiting action
  in_progress: "pending",
  partial: "pending",
  open: "pending", // Shopify Return.status=OPEN — under processing
  complete: "delivered",
  closed: "delivered", // Shopify Return.status=CLOSED — terminal
};

interface StatusBadgeProps {
  /** Status value to display and color-code. Case-insensitive. */
  status: string;
  /** Pill sizing. */
  size?: "sm" | "default";
  className?: string;
}

// Display label overrides — backend enum kept untouched, admin sees the
// friendlier business-domain term (e.g. REJECTED → DECLINED).
const DISPLAY_LABEL_OVERRIDES: Record<string, string> = {
  rejected: "Declined",
};

function formatStatus(status: string): string {
  const override = DISPLAY_LABEL_OVERRIDES[status.toLowerCase()];
  if (override) return override.toUpperCase();
  return status.replace(/_/g, " ").toUpperCase();
}

function resolveVariant(status: string): StatusVariant {
  return STATUS_ALIAS[status.toLowerCase()] ?? "delivered";
}

export function StatusBadge({
  status,
  size = "default",
  className,
}: StatusBadgeProps) {
  const variant = resolveVariant(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold tracking-wider whitespace-nowrap",
        VARIANT_CLASSES[variant],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        className,
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
