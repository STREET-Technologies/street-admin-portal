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
  getRetailerBilling,
  getRetailerOutlets,
  setOutletPublished,
  setOutletActive,
  setOutletPrimary,
  updateRetailer,
  setRetailerActive,
  resyncRetailerFromShopify,
  createRetailerStaff,
  setRetailerStaffOutlet,
  resetRetailerStaffPassword,
  setRetailerStaffDisabled,
  type UpdateRetailerPayload,
  type CreateStaffPayload,
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
  billing: (id: string, billingStatus?: string | null, page = 1) =>
    [
      ...retailerKeys.detail(id),
      "billing",
      billingStatus ?? "all",
      page,
    ] as const,
  outlets: (id: string) =>
    [...retailerKeys.detail(id), "outlets"] as const,
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

/**
 * Billing health. `billingStatus` narrows the per-order ledger server-side;
 * the status counts always span every order, filtered or not.
 */
export function useRetailerBillingQuery(
  retailerId: string,
  billingStatus?: string | null,
  page = 1,
) {
  return useQuery({
    queryKey: retailerKeys.billing(retailerId, billingStatus, page),
    queryFn: () => getRetailerBilling(retailerId, billingStatus, page),
    placeholderData: keepPreviousData,
    enabled: Boolean(retailerId),
  });
}

export function useRetailerOutletsQuery(retailerId: string) {
  return useQuery({
    queryKey: retailerKeys.outlets(retailerId),
    queryFn: () => getRetailerOutlets(retailerId),
    enabled: Boolean(retailerId),
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/** Create a staff account for a retailer. Invalidates the staff list on success. */
export function useCreateRetailerStaffMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffPayload) =>
      createRetailerStaff(retailerId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.staff(retailerId),
      });
    },
  });
}

/** Assign/clear a staff account's outlet. Invalidates the staff list on success. */
export function useSetStaffOutletMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      outletId,
    }: {
      userId: string;
      outletId: string | null;
    }) => setRetailerStaffOutlet(retailerId, userId, outletId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.staff(retailerId),
      });
    },
  });
}

/** Reset a staff account's password (emails the set-password link). TT-295. */
export function useResetStaffPasswordMutation(retailerId: string) {
  return useMutation({
    mutationFn: (userId: string) =>
      resetRetailerStaffPassword(retailerId, userId),
  });
}

/** Deactivate/reactivate a staff account. Invalidates the staff list. TT-295. */
export function useSetStaffDisabledMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, disabled }: { userId: string; disabled: boolean }) =>
      setRetailerStaffDisabled(retailerId, userId, disabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.staff(retailerId),
      });
    },
  });
}

/** Toggle outlet published state. Invalidates the outlets list on success. */
export function useSetOutletPublishedMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      outletId,
      isPublished,
    }: {
      outletId: string;
      isPublished: boolean;
    }) => setOutletPublished(retailerId, outletId, isPublished),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.outlets(retailerId),
      });
    },
  });
}

/** Toggle outlet active state. Invalidates the outlets list on success. */
export function useSetOutletActiveMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      outletId,
      isActive,
    }: {
      outletId: string;
      isActive: boolean;
    }) => setOutletActive(retailerId, outletId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.outlets(retailerId),
      });
    },
  });
}

/**
 * Re-elect an outlet as primary.
 * Invalidates outlets list AND retailer detail (vendor address/coords change).
 */
export function useSetOutletPrimaryMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outletId: string) => setOutletPrimary(retailerId, outletId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.outlets(retailerId),
      });
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.detail(retailerId),
      });
    },
  });
}

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

/** Brand-level activate/deactivate (TT-355). Refreshes detail + lists. */
export function useSetRetailerActiveMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isActive: boolean) => setRetailerActive(retailerId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.detail(retailerId),
      });
      void queryClient.invalidateQueries({ queryKey: retailerKeys.lists() });
    },
  });
}

/**
 * Re-sync store-level details from Shopify (TT-315). On success the backend has
 * overwritten the vendor's brand/contact/locale, so invalidate the detail cache
 * to pull the refreshed record into the portal.
 */
export function useResyncRetailerFromShopifyMutation(retailerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resyncRetailerFromShopify(retailerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: retailerKeys.detail(retailerId),
      });
    },
  });
}
