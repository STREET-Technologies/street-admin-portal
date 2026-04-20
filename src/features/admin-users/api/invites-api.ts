import { api } from "@/lib/api-client";
import type { BackendAdminInvite, SendInvitePayload } from "../types";

export function getPendingInvites(): Promise<BackendAdminInvite[]> {
  return api
    .getRaw<{ data: BackendAdminInvite[] }>("admin/admin-users/invites")
    .then((res) => res.data);
}

export function sendInvite(payload: SendInvitePayload): Promise<void> {
  return api.post("admin/admin-users/invite", payload).then(() => undefined);
}

export function revokeInvite(inviteId: string): Promise<void> {
  return api.delete(`admin/admin-users/invites/${inviteId}`).then(() => undefined);
}

export function acceptInvite(payload: {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<void> {
  return api.post("auth/admin/accept-invite", payload).then(() => undefined);
}
