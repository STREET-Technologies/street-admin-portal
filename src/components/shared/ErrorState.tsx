import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Error state with retry capability.
 *
 * Displays a red AlertCircle icon, a title, an optional message, and
 * a "Try Again" button when an `onRetry` callback is provided.
 */

interface ErrorStateProps {
  /** Heading shown above the error message. */
  title?: string;
  /** Detailed explanation of what went wrong. */
  message?: string;
  /** If provided, renders a "Try Again" button. */
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
      role="alert"
    >
      <AlertCircle
        className="mb-4 size-12 text-red-500"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <h3 className="text-lg font-semibold">{title}</h3>

      {message && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
