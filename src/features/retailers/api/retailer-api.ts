import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { BackendVendor, RetailerListParams } from "../types";

/**
 * Retailer API layer.
 *
 * Backend uses "vendor" terminology. All endpoints hit /admin/vendors.
 * The transform from BackendVendor -> RetailerViewModel happens in the
 * query hooks (via TanStack Query `select`), not here.
 */

/** Fetch a paginated list of vendors (retailers). */
export function getRetailers(
  params: RetailerListParams = {},
): Promise<PaginatedResponse<BackendVendor>> {
  const searchParams = new URLSearchParams();

  if (params.name) searchParams.set("name", params.name);
  if (params.vendorCategory) searchParams.set("vendorCategory", params.vendorCategory);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `admin/vendors?${query}` : "admin/vendors";

  return api.getRaw<PaginatedResponse<BackendVendor>>(endpoint);
}

/** Fetch a single vendor (retailer) by ID. */
export function getRetailer(retailerId: string): Promise<BackendVendor> {
  return api.get<BackendVendor>(`admin/vendors/${retailerId}`);
}

/** Order shape returned by /admin/vendors/:id/orders. */
export interface BackendVendorOrder {
  id: string;
  orderNumber: string | null;
  status: string;
  totalAmount: number | null;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fetch orders belonging to a specific vendor (retailer). */
export function getRetailerOrders(
  retailerId: string,
): Promise<BackendVendorOrder[]> {
  return api.get<BackendVendorOrder[]>(`admin/vendors/${retailerId}/orders`);
}
