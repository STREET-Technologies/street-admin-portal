import { api } from "@/lib/api-client";
import type { AdminRole } from "../../auth/types";
import type { BackendAdminUser } from "../types";

/** Fetch all admin user accounts. */
export function getAdminUsers(): Promise<BackendAdminUser[]> {
  return api.get<BackendAdminUser[]>("admin/admin-users");
}

/** Update the role of an admin user. */
export async function updateAdminUserRole(
  userId: string,
  adminRole: AdminRole,
): Promise<void> {
  await api.patch(`admin/admin-users/${userId}/role`, { adminRole });
}

/** Disable an admin user account. */
export async function disableAdminUser(userId: string): Promise<void> {
  await api.patch(`admin/admin-users/${userId}/disable`, {});
}

/** Enable an admin user account. */
export async function enableAdminUser(userId: string): Promise<void> {
  await api.patch(`admin/admin-users/${userId}/enable`, {});
}
