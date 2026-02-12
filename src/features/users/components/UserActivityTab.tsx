import { useMemo } from "react";
import {
  ActivityTimeline,
  type TimelineEvent,
} from "@/components/shared/ActivityTimeline";
import { useNotesQuery } from "@/features/notes/api/notes-queries";
import type { UserViewModel } from "../types";

interface UserActivityTabProps {
  userId: string;
  user: UserViewModel;
}

export function UserActivityTab({ userId, user }: UserActivityTabProps) {
  const { data: notes, isLoading } = useNotesQuery("user", userId);

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
    if (user.updatedAt && user.updatedAt !== user.createdAt) {
      items.push({
        type: "updated",
        title: "Account updated",
        timestamp: user.updatedAt,
      });
    }

    // Account created
    if (user.createdAt) {
      items.push({
        type: "created",
        title: "Account created",
        timestamp: user.createdAt,
      });
    }

    // Sort newest first
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return items;
  }, [notes, user.createdAt, user.updatedAt]);

  return (
    <ActivityTimeline
      events={events}
      isLoading={isLoading}
      emptyMessage="No activity recorded for this user"
    />
  );
}
