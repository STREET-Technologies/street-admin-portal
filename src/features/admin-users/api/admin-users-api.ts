import { api } from "@/lib/api-client";
import type { AdminRole } from "../../auth/types";
import type { BackendAdminUser } from "../types";

/** Fetch all admin user accounts. */
export function getAdminUsers(): Promise<BackendAdminUser[]> {
  return api.get<{ users: BackendAdminUser[] }>("admin/admin-users").then(
    (data) => data.users,
  );
}

/** Update the role of an admin user. */
export async function updateAdminUserRole(
  userId: string,
  adminRole: AdminRole,
): Promise<void> {
  await api.patch(`admin/admin-users/${userId}/role`, { adminRole });
}
