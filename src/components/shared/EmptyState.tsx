import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Empty state placeholder with optional icon and action button.
 *
 * Used when a list or detail view has no data to display.
 * Provides a helpful message and (optionally) a primary action
 * so the user knows what to do next.
 */

interface EmptyStateProps {
  /** Optional icon displayed above the title. */
  icon?: LucideIcon;
  /** Primary message shown to the user. */
  title: string;
  /** Supporting explanation (e.g. "Try adjusting your filters"). */
  description?: string;
  /** Optional action button rendered below the description. */
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <Icon
          className="mb-4 size-12 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}

      <h3 className="text-lg font-semibold">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && (
        <Button onClick={action.onClick} className="mt-6" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
