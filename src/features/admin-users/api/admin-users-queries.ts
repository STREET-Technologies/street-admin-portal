import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, disableAdminUser, enableAdminUser } from "./admin-users-api";
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

export function useDisableAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => disableAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useEnableAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => enableAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}
