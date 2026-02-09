import { useState } from "react";
import { StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  useNotesQuery,
  useCreateNoteMutation,
} from "../api/notes-queries";
import type { NoteEntityType, NotePriority, NoteViewModel } from "../types";

// ---------------------------------------------------------------------------
// Priority badge
// ---------------------------------------------------------------------------

const priorityStyles: Record<NotePriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
};

function PriorityBadge({ priority }: { priority: NotePriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityStyles[priority]}`}
    >
      {priority}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

function formatNoteDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} at ${time}`;
}

// ---------------------------------------------------------------------------
// Note card
// ---------------------------------------------------------------------------

function NoteCard({ note }: { note: NoteViewModel }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-semibold">
            {note.authorName}
          </CardTitle>
          <PriorityBadge priority={note.priority} />
          <span className="ml-auto text-xs text-muted-foreground">
            {formatNoteDate(note.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create note form
// ---------------------------------------------------------------------------

function CreateNoteForm({
  entityType,
  entityId,
}: {
  entityType: NoteEntityType;
  entityId: string;
}) {
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<NotePriority>("medium");
  const mutation = useCreateNoteMutation(entityType, entityId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    mutation.mutate(
      { entityType, entityId, content: trimmed, priority },
      {
        onSuccess: () => {
          setContent("");
          setPriority("medium");
          toast.success("Note added");
        },
        onError: () => {
          toast.error("Failed to add note");
        },
      },
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as NotePriority)}
            >
              <SelectTrigger size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              size="sm"
              disabled={mutation.isPending || !content.trim()}
            >
              {mutation.isPending ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// NotesPanel
// ---------------------------------------------------------------------------

interface NotesPanelProps {
  entityType: NoteEntityType;
  entityId: string;
}

export function NotesPanel({ entityType, entityId }: NotesPanelProps) {
  const { data: notes, isLoading, isError, error, refetch } = useNotesQuery(
    entityType,
    entityId,
  );

  return (
    <div className="space-y-4">
      {/* Create note form */}
      <CreateNoteForm entityType={entityType} entityId={entityId} />

      {/* Notes list */}
      {isLoading && <LoadingState variant="card" rows={3} />}

      {isError && (
        <ErrorState
          title="Failed to load notes"
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && notes && notes.length === 0 && (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Add a note above to get started."
        />
      )}

      {!isLoading &&
        !isError &&
        notes &&
        notes.length > 0 &&
        notes.map((note) => <NoteCard key={note.id} note={note} />)}
    </div>
  );
}
