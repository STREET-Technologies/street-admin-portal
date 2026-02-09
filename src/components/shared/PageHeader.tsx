import { cn } from "@/lib/utils";

/**
 * Consistent page header used at the top of every list and detail page.
 *
 * Renders a title on the left and optional action buttons (passed as
 * children) on the right. Includes an optional description below the title.
 */

interface PageHeaderProps {
  /** Page title displayed as an h1. */
  title: string;
  /** Optional subtitle rendered below the title. */
  description?: string;
  /** Action buttons rendered on the right side. */
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
