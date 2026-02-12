import { type LucideIcon, StickyNote, UserPlus, RefreshCw, ArrowRightLeft, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  type: "note" | "created" | "updated" | "status_change";
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  metadata?: Record<string, string>;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  emptyMessage?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EVENT_ICON: Record<TimelineEvent["type"], LucideIcon> = {
  note: StickyNote,
  created: UserPlus,
  updated: RefreshCw,
  status_change: ArrowRightLeft,
};

const DOT_COLOR: Record<TimelineEvent["type"], string> = {
  note: "bg-blue-500",
  created: "bg-emerald-500",
  updated: "bg-gray-400",
  status_change: "bg-amber-500",
};

const ICON_COLOR: Record<TimelineEvent["type"], string> = {
  note: "text-blue-500",
  created: "text-emerald-500",
  updated: "text-muted-foreground",
  status_change: "text-amber-500",
};

/** Return a human-readable relative time string. */
function relativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return "just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

// ---------------------------------------------------------------------------
// Priority badge (matches NotesPanel style)
// ---------------------------------------------------------------------------

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

function MetadataBadge({ label, value, variant }: { label: string; value: string; variant?: string }) {
  const style = variant ? priorityStyles[variant] : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        style,
      )}
    >
      {label}: {value}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Skeleton className="size-3 rounded-full" />
            {i < 3 && <Skeleton className="mt-1 h-10 w-0.5" />}
          </div>
          <div className="flex-1 space-y-1.5 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function TimelineEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <History className="mb-3 size-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline event row
// ---------------------------------------------------------------------------

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const Icon = event.icon ?? EVENT_ICON[event.type];
  const dotColor = DOT_COLOR[event.type];
  const iconColor = ICON_COLOR[event.type];

  return (
    <div className="flex gap-3">
      {/* Left rail: dot + connecting line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mt-1 size-2.5 shrink-0 rounded-full ring-2 ring-background",
            dotColor,
          )}
          aria-hidden="true"
        />
        {!isLast && (
          <div className="mt-1 w-px flex-1 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <div className="flex items-center gap-2">
          <Icon className={cn("size-3.5 shrink-0", iconColor)} />
          <span className="text-sm font-medium">{event.title}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {relativeTime(event.timestamp)}
          </span>
        </div>

        {event.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            {event.description}
          </p>
        )}

        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {Object.entries(event.metadata).map(([key, value]) => (
              <MetadataBadge
                key={key}
                label={key}
                value={value}
                variant={key === "priority" ? value : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActivityTimeline
// ---------------------------------------------------------------------------

export function ActivityTimeline({
  events,
  isLoading = false,
  emptyMessage = "No activity recorded",
}: ActivityTimelineProps) {
  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (events.length === 0) {
    return <TimelineEmpty message={emptyMessage} />;
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <TimelineItem
          key={`${event.type}-${event.timestamp}-${index}`}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
}
