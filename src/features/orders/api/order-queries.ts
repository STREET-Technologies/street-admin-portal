import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getOrdersByVendor,
  getOrdersByUser,
  type GetOrdersByVendorParams,
  type GetOrdersByUserParams,
} from "./order-api";
import { toOrderViewModel } from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

/**
 * Query key factory for order queries.
 *
 * Structure:
 *   ["orders"]                                        -- all order queries
 *   ["orders", "list"]                                -- all list variants
 *   ["orders", "list", "vendor", vendorId, { ... }]   -- vendor-scoped list
 *   ["orders", "list", "user", userId, { ... }]       -- user-scoped list
 *   ["orders", "detail"]                              -- all detail variants
 *   ["orders", "detail", orderId]                     -- specific order
 */
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  listByVendor: (vendorId: string, params: Omit<GetOrdersByVendorParams, "vendorId">) =>
    [...orderKeys.lists(), "vendor", vendorId, params] as const,
  listByUser: (userId: string, params: Omit<GetOrdersByUserParams, "userId">) =>
    [...orderKeys.lists(), "user", userId, params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (orderId: string) => [...orderKeys.details(), orderId] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/**
 * Paginated orders for a specific vendor.
 * Transforms each order to OrderViewModel via select.
 */
export function useVendorOrdersQuery(
  vendorId: string,
  params: Omit<GetOrdersByVendorParams, "vendorId"> = {},
) {
  return useQuery({
    queryKey: orderKeys.listByVendor(vendorId, params),
    queryFn: () => getOrdersByVendor({ vendorId, ...params }),
    enabled: Boolean(vendorId),
    placeholderData: keepPreviousData,
    select: (response) => ({
      data: response.data.orders.map(toOrderViewModel),
      meta: response.data.meta,
    }),
  });
}

/**
 * Orders for a specific user.
 * Transforms each order to OrderViewModel via select.
 */
export function useUserOrdersQuery(
  userId: string,
  params: Omit<GetOrdersByUserParams, "userId"> = {},
) {
  return useQuery({
    queryKey: orderKeys.listByUser(userId, params),
    queryFn: () => getOrdersByUser({ userId, ...params }),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    select: (orders) => orders.map(toOrderViewModel),
  });
}
