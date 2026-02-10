import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "./admin-users-api";
import { toAdminUserViewModel } from "../types";

export const adminUserKeys = {
  all: ["admin-users"] as const,
  list: () => [...adminUserKeys.all, "list"] as const,
};

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUserKeys.list(),
    queryFn: getAdminUsers,
    select: (users) => users.map(toAdminUserViewModel),
  });
}
