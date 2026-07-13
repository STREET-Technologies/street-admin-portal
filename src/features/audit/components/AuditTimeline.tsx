import { ActivityTimeline, type TimelineEvent } from "@/components/shared/ActivityTimeline";
import { type AuditEntry } from "../api/audit-api";

function formatFieldName(field: string): string {
  // Backend action audits (TT-356) send already-humanized labels that may
  // contain spaces, dashes, or quotes (e.g. `Outlet published — Camden`).
  // Pass those through untouched apart from a leading capital, so the camelCase
  // splitter doesn't mangle embedded names.
  if (/[\s"'—]/.test(field)) {
    return field.charAt(0).toUpperCase() + field.slice(1);
  }
  // Single camelCase token from a field diff → "Spaced Title".
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

function toTimelineEvent(entry: AuditEntry): TimelineEvent {
  const actorName = entry.actor?.name ?? "Admin";
  const field = formatFieldName(entry.field);
  const from = entry.oldValue ?? "(none)";
  const to = entry.newValue ?? "(none)";

  return {
    type: "updated",
    title: `${actorName} changed ${field}`,
    description: `From "${from}" → "${to}"`,
    timestamp: entry.createdAt,
  };
}

interface AuditTimelineProps {
  entries: AuditEntry[];
  isLoading?: boolean;
  entityCreatedAt?: string;
}

export function AuditTimeline({ entries, isLoading, entityCreatedAt }: AuditTimelineProps) {
  const events: TimelineEvent[] = entries.map(toTimelineEvent);

  if (entityCreatedAt) {
    events.push({
      type: "created",
      title: "Account created",
      timestamp: entityCreatedAt,
    });
  }

  return (
    <ActivityTimeline
      events={events}
      isLoading={isLoading}
      emptyMessage="No activity recorded yet"
    />
  );
}
