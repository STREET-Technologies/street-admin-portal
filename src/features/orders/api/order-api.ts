import { api } from "@/lib/api-client";
import type { BackendOrder } from "../types";

// ---------------------------------------------------------------------------
// Request params
// ---------------------------------------------------------------------------

export interface GetOrdersParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

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
// Response shapes
// ---------------------------------------------------------------------------

/** Raw response from GET /admin/orders (global orders list). */
export interface OrdersListRawResponse {
  message: string;
  data: BackendOrder[];
  meta: { total: number; limit: number; page: number };
}

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

/** Fetch global orders list with search, status filter, and pagination. */
export async function getOrders(
  params: GetOrdersParams = {},
): Promise<OrdersListRawResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const endpoint = `admin/orders${query ? `?${query}` : ""}`;

  return api.getRaw<OrdersListRawResponse>(endpoint);
}

/** Fetch a single order by its display ID (ST-XXXXX). */
export async function getOrderByOrderId(
  orderId: string,
): Promise<BackendOrder> {
  return api.get<BackendOrder>(`admin/orders/${orderId}`);
}

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
