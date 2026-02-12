import { useMemo } from "react";
import {
  ActivityTimeline,
  type TimelineEvent,
} from "@/components/shared/ActivityTimeline";
import { useNotesQuery } from "@/features/notes/api/notes-queries";
import type { RetailerViewModel } from "../types";

interface RetailerActivityTabProps {
  retailerId: string;
  retailer: RetailerViewModel;
}

export function RetailerActivityTab({ retailerId, retailer }: RetailerActivityTabProps) {
  // Backend uses "vendor" for retailer entity type
  const { data: notes, isLoading } = useNotesQuery("vendor", retailerId);

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

    // Account updated (only if different from createdAt)
    if (retailer.updatedAt && retailer.updatedAt !== retailer.createdAt) {
      items.push({
        type: "updated",
        title: "Account updated",
        timestamp: retailer.updatedAt,
      });
    }

    // Account created
    if (retailer.createdAt) {
      items.push({
        type: "created",
        title: "Account created",
        timestamp: retailer.createdAt,
      });
    }

    // Sort newest first
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return items;
  }, [notes, retailer.createdAt, retailer.updatedAt]);

  return (
    <ActivityTimeline
      events={events}
      isLoading={isLoading}
      emptyMessage="No activity recorded for this retailer"
    />
  );
}
