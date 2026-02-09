import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function UserNotesTab() {
  return (
    <EmptyState
      icon={StickyNote}
      title="Notes"
      description="Notes will be available in Phase 4."
    />
  );
}
