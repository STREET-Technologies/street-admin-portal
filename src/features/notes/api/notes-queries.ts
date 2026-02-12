import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes, createNote } from "./notes-api";
import { toNoteViewModel, type NoteEntityType } from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const noteKeys = {
  all: ["notes"] as const,
  list: (entityType: NoteEntityType, entityId: string) =>
    [...noteKeys.all, entityType, entityId] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/** Fetch notes for an entity. Transforms to NoteViewModel, sorted newest-first. */
export function useNotesQuery(entityType: NoteEntityType, entityId: string) {
  return useQuery({
    queryKey: noteKeys.list(entityType, entityId),
    queryFn: () => getNotes(entityType, entityId),
    enabled: !!entityId,
    select: (data) =>
      data
        .map(toNoteViewModel)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
  });
}

/** Create a note and invalidate the notes list to refetch. */
export function useCreateNoteMutation(
  entityType: NoteEntityType,
  entityId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: noteKeys.list(entityType, entityId),
      });
    },
  });
}
