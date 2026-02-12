// ---------------------------------------------------------------------------
// Backend shapes (what the API returns)
// ---------------------------------------------------------------------------

/** Entity types supported by the notes endpoint. */
export type NoteEntityType = "user" | "vendor" | "courier";

/** Note priority levels. */
export type NotePriority = "low" | "medium" | "high";

/** Note entity as returned by the backend API. */
export interface BackendNote {
  id: string;
  entityType: NoteEntityType;
  entityId: string;
  content: string;
  priority: NotePriority;
  authorId: string;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Frontend view models (what components consume)
// ---------------------------------------------------------------------------

/** Transformed note for display. */
export interface NoteViewModel {
  id: string;
  content: string;
  priority: NotePriority;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

/** Payload for creating a new note. */
export interface CreateNotePayload {
  entityType: NoteEntityType;
  entityId: string;
  content: string;
  priority: NotePriority;
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

/** Build a display name from nullable first/last name fields. */
function buildAuthorName(
  firstName: string | null,
  lastName: string | null,
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown";
}

/** Transform a BackendNote into a NoteViewModel for UI consumption. */
export function toNoteViewModel(backend: BackendNote): NoteViewModel {
  return {
    id: backend.id,
    content: backend.content,
    priority: backend.priority,
    authorName: buildAuthorName(
      backend.author.firstName,
      backend.author.lastName,
    ),
    authorEmail: backend.author.email ?? "",
    createdAt: backend.createdAt,
  };
}
