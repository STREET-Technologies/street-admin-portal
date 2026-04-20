import { ActivityTimeline, type TimelineEvent } from "@/components/shared/ActivityTimeline";
import { type AuditEntry } from "../api/audit-api";

function formatFieldName(field: string): string {
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
}

export function AuditTimeline({ entries, isLoading }: AuditTimelineProps) {
  return (
    <ActivityTimeline
      events={entries.map(toTimelineEvent)}
      isLoading={isLoading}
      emptyMessage="No field changes recorded yet"
    />
  );
}
