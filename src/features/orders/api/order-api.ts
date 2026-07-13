import { api, toQueryString } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { BackendOrder } from "../types";

// ---------------------------------------------------------------------------
// Request params
// ---------------------------------------------------------------------------

export interface GetOrdersParams {
  search?: string;
  /**
   * Single status (e.g. "DELIVERED") or comma-separated list
   * (e.g. "CONFIRMED,IN_PACKING,IN_DELIVERY") for multi-status tab buckets.
   */
  status?: string;
  paymentMethod?: string;
  /** When true, only orders whose reconciliation cron gave up (powers the Stuck tab). */
  stuck?: boolean;
  /**
   * Single returnStatus value or comma-separated list (TT-226). Powers the
   * Returned tab. Values: REQUESTED | IN_PROGRESS | PARTIAL | COMPLETE.
   */
  returnStatus?: string;
  /** Backend allowlist: orderId | customerName | totalAmount | createdAt */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
// API functions
// ---------------------------------------------------------------------------

/** Fetch global orders list with search, status filter, and pagination. */
export function getOrders(
  params: GetOrdersParams = {},
): Promise<PaginatedResponse<BackendOrder>> {
  return api.getPaginated<BackendOrder>(
    `admin/orders${toQueryString({ ...params, stuck: params.stuck || undefined })}`,
  );
}

/** Fetch a single order by its display ID (ST-XXXXX). */
export async function getOrderByOrderId(
  orderId: string,
): Promise<BackendOrder> {
  return api.get<BackendOrder>(`admin/orders/${orderId}`);
}

/** Fetch orders for a specific vendor (admin endpoint). */
export function getOrdersByVendor(
  params: GetOrdersByVendorParams,
): Promise<PaginatedResponse<BackendOrder>> {
  const { vendorId, ...rest } = params;
  return api.getPaginated<BackendOrder>(
    `admin/vendors/${vendorId}/orders${toQueryString(rest)}`,
  );
}

/** Fetch orders for a specific user (admin endpoint). */
export function getOrdersByUser(
  params: GetOrdersByUserParams,
): Promise<BackendOrder[]> {
  const { userId, ...rest } = params;
  return api.get<BackendOrder[]>(
    `admin/users/${userId}/orders${toQueryString(rest)}`,
  );
}
