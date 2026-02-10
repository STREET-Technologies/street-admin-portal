import { api } from "@/lib/api-client";
import type { BackendAdminUser } from "../types";

/** Fetch all admin user accounts. */
export function getAdminUsers(): Promise<BackendAdminUser[]> {
  return api.get<{ users: BackendAdminUser[] }>("admin/admin-users").then(
    (data) => data.users,
  );
}
