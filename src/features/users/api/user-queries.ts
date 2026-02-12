import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getUsers,
  getUser,
  getUserAddresses,
  getUserOrders,
  getUserDevices,
  getUserStats,
  updateUser,
  type GetUsersParams,
  type UpdateUserPayload,
} from "./user-api";
import { toUserViewModel } from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  addresses: (id: string) => [...userKeys.detail(id), "addresses"] as const,
  orders: (id: string) => [...userKeys.detail(id), "orders"] as const,
  devices: (id: string) => [...userKeys.detail(id), "devices"] as const,
  stats: (id: string) => [...userKeys.all, "stats", id] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/** Paginated user list. Transforms each user to UserViewModel via select. */
export function useUsersQuery(params: GetUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
    select: (response) => ({
      ...response,
      data: response.data.map(toUserViewModel),
    }),
  });
}

/** Single user detail. Transforms to UserViewModel via select. */
export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUser(userId),
    enabled: !!userId,
    select: toUserViewModel,
  });
}

/** User addresses list. */
export function useUserAddressesQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.addresses(userId),
    queryFn: () => getUserAddresses(userId),
    enabled: !!userId,
  });
}

/** User orders list. */
export function useUserOrdersQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.orders(userId),
    queryFn: () => getUserOrders(userId),
    enabled: !!userId,
  });
}

/** User devices list. */
export function useUserDevicesQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.devices(userId),
    queryFn: () => getUserDevices(userId),
    enabled: !!userId,
  });
}

/** User order stats (total orders, total spent, etc.). */
export function useUserStatsQuery(userId: string) {
  return useQuery({
    queryKey: userKeys.stats(userId),
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/** Update user fields and invalidate the detail cache to refetch. */
export function useUpdateUserMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UpdateUserPayload>) => updateUser(userId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: userKeys.detail(userId),
      });
    },
  });
}
