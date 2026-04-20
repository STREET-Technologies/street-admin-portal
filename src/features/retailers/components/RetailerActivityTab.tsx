import { useMemo } from "react";
import {
  ActivityTimeline,
  type TimelineEvent,
} from "@/components/shared/ActivityTimeline";
import { ErrorState } from "@/components/shared/ErrorState";
import { useVendorActivityQuery } from "@/features/audit/api/audit-queries";
import { AuditTimeline } from "@/features/audit/components/AuditTimeline";
import { useNotesQuery } from "@/features/notes/api/notes-queries";
import type { RetailerViewModel } from "../types";

interface RetailerActivityTabProps {
  retailerId: string;
  retailer: RetailerViewModel;
}

export function RetailerActivityTab({ retailerId, retailer }: RetailerActivityTabProps) {
  // Backend uses "vendor" for retailer entity type
  const { data: notes, isLoading } = useNotesQuery("vendor", retailerId);
  const auditQuery = useVendorActivityQuery(retailerId);

  const events = useMemo<TimelineEvent[]>(() => {
    const items: TimelineEvent[] = [];

    // Map notes to timeline events
    if (notes) {
      for (const note of notes) {
        items.push({
          type: "note",
          title: "Note added",
          description:
            note.content.length > 200
              ? note.content.slice(0, 200) + "..."
              : note.content,
          timestamp: note.createdAt,
          metadata: {
            author: note.authorName,
            priority: note.priority,
          },
        });
      }
    }

    // Sort newest first
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return items;
  }, [notes]);

  return (
    <div>
      {(isLoading || events.length > 0) && (
        <>
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Notes</h3>
          <ActivityTimeline
            events={events}
            isLoading={isLoading}
            emptyMessage="No notes recorded"
          />
        </>
      )}
      <div className="mt-8">
        <AuditTimeline
          entries={auditQuery.data?.data ?? []}
          isLoading={auditQuery.isLoading}
          entityCreatedAt={retailer.createdAt}
        />
        {auditQuery.isError && (
          <ErrorState message="Failed to load audit history" />
        )}
      </div>
    </div>
  );
}
