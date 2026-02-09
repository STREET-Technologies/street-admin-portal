import { NotesPanel } from "@/features/notes/components/NotesPanel";

interface RetailerNotesTabProps {
  retailerId: string;
}

export function RetailerNotesTab({ retailerId }: RetailerNotesTabProps) {
  return <NotesPanel entityType="vendor" entityId={retailerId} />;
}
