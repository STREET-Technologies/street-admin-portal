import { api } from "@/lib/api-client";
import type { BackendNote, CreateNotePayload, NoteEntityType } from "../types";

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch all notes for a given entity. */
export async function getNotes(
  entityType: NoteEntityType,
  entityId: string,
): Promise<BackendNote[]> {
  return api.get<BackendNote[]>(`admin/notes/${entityType}/${entityId}`);
}

/** Create a new note on an entity. */
export async function createNote(
  payload: CreateNotePayload,
): Promise<BackendNote> {
  return api.post<BackendNote>("admin/notes", payload);
}
