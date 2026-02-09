import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export function RetailerNotesTab() {
  return (
    <EmptyState
      icon={StickyNote}
      title="Notes coming soon"
      description="Admin notes for retailers will be available in Phase 4."
    />
  );
}
