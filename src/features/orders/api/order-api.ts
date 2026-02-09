import { api } from "@/lib/api-client";
import type { BackendOrder } from "../types";

// ---------------------------------------------------------------------------
// Request params
// ---------------------------------------------------------------------------

export interface GetOrdersByVendorParams {
  vendorId: string;
  page?: number;
  limit?: number;
}

export interface GetOrdersByUserParams {
  userId: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------

/**
 * The vendor orders endpoint wraps results in a nested data envelope:
 * { message: string, data: { orders: BackendOrder[], meta: { total, limit, page } } }
 *
 * We use api.getRaw to skip the outer envelope unwrapping, then
 * manually extract the inner `data` payload.
 */
export interface VendorOrdersRawResponse {
  message: string;
  data: {
    orders: BackendOrder[];
    meta: {
      total: number;
      limit: number;
      page: number;
    };
  };
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch orders for a specific vendor (admin endpoint). */
export async function getOrdersByVendor(
  params: GetOrdersByVendorParams,
): Promise<VendorOrdersRawResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const endpoint = `admin/vendors/${params.vendorId}/orders${query ? `?${query}` : ""}`;

  return api.getRaw<VendorOrdersRawResponse>(endpoint);
}

/** Fetch orders for a specific user (admin endpoint). */
export async function getOrdersByUser(
  params: GetOrdersByUserParams,
): Promise<BackendOrder[]> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const endpoint = `admin/users/${params.userId}/orders${query ? `?${query}` : ""}`;

  return api.get<BackendOrder[]>(endpoint);
}
