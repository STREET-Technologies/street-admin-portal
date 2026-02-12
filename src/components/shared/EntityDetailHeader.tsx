import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

/**
 * Top section header for entity detail pages (user, retailer, courier, order).
 *
 * Stripe-style layout: Avatar | Title + Subtitle + Status | Actions (right).
 * Renders an avatar with optional image or initials fallback, the entity name,
 * an optional subtitle (e.g. email), a status badge, and action buttons.
 */

interface EntityDetailHeaderProps {
  /** Primary name displayed as the heading. */
  title: string;
  /** Secondary text below the title (e.g. email address). */
  subtitle?: string;
  /** Renders a StatusBadge if provided. */
  status?: string;
  /** URL for the avatar image. */
  avatarUrl?: string;
  /** Initials shown when no avatar image is available. */
  avatarFallback?: string;
  /** Action buttons rendered on the right side. */
  children?: ReactNode;
  className?: string;
}

export function EntityDetailHeader({
  title,
  subtitle,
  status,
  avatarUrl,
  avatarFallback,
  children,
  className,
}: EntityDetailHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={title} />}
          <AvatarFallback>
            {avatarFallback ?? title.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {status && <StatusBadge status={status} size="sm" />}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
