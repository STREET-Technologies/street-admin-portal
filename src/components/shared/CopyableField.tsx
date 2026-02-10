import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "@/lib/utils";

/**
 * Inline label + value display with a copy button that appears on hover.
 *
 * Used on detail pages for IDs, emails, phone numbers, and other
 * values that support staff frequently need to copy.
 */

interface CopyableFieldProps {
  /** Label displayed above or beside the value. */
  label: string;
  /** The text value to display and copy. */
  value: string;
  /** Use monospace font for the value (useful for IDs, codes). */
  mono?: boolean;
  className?: string;
}

export function CopyableField({
  label,
  value,
  mono = false,
  className,
}: CopyableFieldProps) {
  return (
    <div className={cn("group/field space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-sm",
            mono && "font-mono text-xs",
          )}
        >
          {value}
        </span>
        <span className="opacity-40 transition-opacity group-hover/field:opacity-100">
          <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
        </span>
      </div>
    </div>
  );
}
