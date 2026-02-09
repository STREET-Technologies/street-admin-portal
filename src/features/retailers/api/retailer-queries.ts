import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getRetailers, getRetailer, getRetailerOrders } from "./retailer-api";
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
