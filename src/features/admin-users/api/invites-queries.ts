import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getPendingInvites, sendInvite, revokeInvite } from "./invites-api";
import type { SendInvitePayload } from "../types";

export const inviteKeys = {
  all: ["admin-invites"] as const,
  pending: () => [...inviteKeys.all, "pending"] as const,
};

export function usePendingInvitesQuery() {
  return useQuery({
    queryKey: inviteKeys.pending(),
    queryFn: getPendingInvites,
  });
}

export function useSendInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInvitePayload) => sendInvite(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
      toast.success("Invite sent");
    },
    onError: () => {
      toast.error("Failed to send invite");
    },
  });
}

export function useRevokeInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
      toast.success("Invite revoked");
    },
    onError: () => {
      toast.error("Failed to revoke invite");
    },
  });
}
