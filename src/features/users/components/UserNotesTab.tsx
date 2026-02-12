import { NotesPanel } from "@/features/notes/components/NotesPanel";

interface UserNotesTabProps {
  userId: string;
}

export function UserNotesTab({ userId }: UserNotesTabProps) {
  return <NotesPanel entityType="user" entityId={userId} />;
}
