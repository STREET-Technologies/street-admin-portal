import { cn } from "@/lib/utils";

/**
 * Color-coded status badge with a small dot indicator.
 *
 * Handles any status string gracefully -- unknown values render in
 * neutral gray so the UI never breaks on unexpected backend data.
 */

type StatusColor = {
  dot: string;
  bg: string;
  text: string;
};

const STATUS_COLORS: Record<string, StatusColor> = {
  // positive
  active: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  delivered: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  paid: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  confirmed: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-400",
  },

  // warning / in-progress
  pending: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-400",
  },
  preparing: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-400",
  },
  ready: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-400",
  },
  in_delivery: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-400",
  },

  // negative
  inactive: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-400",
  },
  cancelled: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-400",
  },
  failed: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-400",
  },

  // neutral
  blocked: {
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
  suspended: {
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
  refunded: {
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
};

const DEFAULT_COLOR: StatusColor = {
  dot: "bg-gray-400",
  bg: "bg-gray-100 dark:bg-gray-800",
  text: "text-gray-700 dark:text-gray-400",
};

interface StatusBadgeProps {
  /** Status value to display and color-code. */
  status: string;
  /** Badge sizing. */
  size?: "sm" | "default";
  className?: string;
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  size = "default",
  className,
}: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? DEFAULT_COLOR;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent font-medium",
        color.bg,
        color.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          color.dot,
          size === "sm" ? "size-1.5" : "size-2",
        )}
        aria-hidden="true"
      />
      {formatStatus(status)}
    </span>
  );
}
