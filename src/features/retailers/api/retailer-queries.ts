import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getRetailers,
  getRetailer,
  getRetailerOrders,
  getRetailerStaff,
  updateRetailer,
  type UpdateRetailerPayload,
} from "./retailer-api";
import { toRetailerViewModel } from "../types";
import type { RetailerListParams } from "../types";

/**
 * Query key factory for retailer (vendor) queries.
 *
 * Structure:
 *   ["retailers"]                       — all retailer queries
 *   ["retailers", "list"]               — all list variants
 *   ["retailers", "list", { ...params }] — specific list with params
 *   ["retailers", "detail"]             — all detail variants
 *   ["retailers", "detail", id]         — specific retailer
 *   ["retailers", "detail", id, "orders"] — retailer's orders
 */
export const retailerKeys = {
  all: ["retailers"] as const,
  lists: () => [...retailerKeys.all, "list"] as const,
  list: (params: RetailerListParams) =>
    [...retailerKeys.lists(), params] as const,
  details: () => [...retailerKeys.all, "detail"] as const,
  detail: (id: string) => [...retailerKeys.details(), id] as const,
  orders: (id: string) =>
    [...retailerKeys.detail(id), "orders"] as const,
  staff: (id: string) =>
    [...retailerKeys.detail(id), "staff"] as const,
};

/**
 * Paginated retailer list.
 * Returns { data: RetailerViewModel[], meta } with backend transform in `select`.
 */
export function useRetailersQuery(params: RetailerListParams = {}) {
  return useQuery({
    queryKey: retailerKeys.list(params),
    queryFn: () => getRetailers(params),
    placeholderData: keepPreviousData,
    select: (response) => ({
      data: response.data.map(toRetailerViewModel),
      meta: response.meta,
    }),
  });
}

/**
 * Single retailer detail.
 * Transforms BackendVendor -> RetailerViewModel in `select`.
 */
export function useRetailerQuery(retailerId: string) {
  return useQuery({
    queryKey: retailerKeys.detail(retailerId),
    queryFn: () => getRetailer(retailerId),
    select: toRetailerViewModel,
    enabled: Boolean(retailerId),
  });
}

/**
 * Orders belonging to a specific retailer.
 */
export function useRetailerOrdersQuery(retailerId: string) {
  return useQuery({
    queryKey: retailerKeys.orders(retailerId),
    queryFn: () => getRetailerOrders(retailerId),
    enabled: Boolean(retailerId),
  });
}

/**
 * Staff accounts linked to a specific retailer.
 */
export function useRetailerStaffQuery(retailerId: string) {
  return useQuery({
    queryKey: retailerKeys.staff(retailerId),
    queryFn: () => getRetailerStaff(retailerId),
    enabled: Boolean(retailerId),
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/** Update retailer fields and invalidate the detail cache to refetch. */
export function useUpdateRetailerMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UpdateRetailerPayload>) =>
      updateRetailer(retailerId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.detail(retailerId),
      });
    },
  });
}
