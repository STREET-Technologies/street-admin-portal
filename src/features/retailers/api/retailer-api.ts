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

/**
 * Backend envelope for GET /admin/vendors (after ResponseInterceptor).
 * Shape: { statusCode, message, data: { data: [...], meta: {...} } }
 */
interface VendorsRawResponse {
  data: {
    data: BackendVendor[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

/** Fetch a paginated list of vendors (retailers). Normalizes to PaginatedResponse. */
export async function getRetailers(
  params: RetailerListParams = {},
): Promise<PaginatedResponse<BackendVendor>> {
  const searchParams = new URLSearchParams();

  if (params.name) searchParams.set("name", params.name);
  if (params.vendorCategory) searchParams.set("vendorCategory", params.vendorCategory);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `admin/vendors?${query}` : "admin/vendors";

  const raw = await api.getRaw<VendorsRawResponse>(endpoint);
  return {
    data: raw.data.data,
    meta: raw.data.meta,
  };
}

/** Fetch a single vendor (retailer) by ID. */
export function getRetailer(retailerId: string): Promise<BackendVendor> {
  return api.get<BackendVendor>(`admin/vendors/${retailerId}`);
}

/** Order shape returned by /admin/vendors/:id/orders (after transform). */
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

/** Raw order shape from backend (nested user relation, string amounts). */
interface RawVendorOrder {
  id: string;
  orderId: string;
  status: string;
  totalAmount: string | number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  user?: { id: string; firstName?: string; lastName?: string; email?: string };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

/** Fetch orders belonging to a specific vendor (retailer). Flattens user relation. */
export async function getRetailerOrders(
  retailerId: string,
): Promise<BackendVendorOrder[]> {
  const data = await api.get<{ orders: RawVendorOrder[] }>(
    `admin/vendors/${retailerId}/orders`,
  );
  return data.orders.map((raw) => ({
    id: raw.id,
    orderNumber: raw.orderId ?? null,
    status: raw.status,
    totalAmount: raw.totalAmount != null ? Number(raw.totalAmount) : null,
    customerName:
      raw.customerName ??
      ([raw.user?.firstName, raw.user?.lastName].filter(Boolean).join(" ") || null),
    customerEmail: raw.customerEmail ?? raw.user?.email ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }));
}

// ---------------------------------------------------------------------------
// Staff accounts
// ---------------------------------------------------------------------------

/** Staff user shape returned by GET /admin/vendors/:id/users. */
export interface BackendVendorStaff {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

/** Fetch user accounts linked to a vendor (retailer staff). */
export async function getRetailerStaff(
  retailerId: string,
): Promise<BackendVendorStaff[]> {
  const data = await api.get<{ users: BackendVendorStaff[] }>(
    `admin/vendors/${retailerId}/users`,
  );
  return data.users;
}

// ---------------------------------------------------------------------------
// Staff creation
// ---------------------------------------------------------------------------

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CreateStaffResult {
  userId: string;
  tempPassword: string;
  email: string;
}

/** Create a new staff account for a vendor (retailer). */
export function createRetailerStaff(
  retailerId: string,
  data: CreateStaffPayload,
): Promise<CreateStaffResult> {
  return api.post<CreateStaffResult>(
    `admin/vendors/${retailerId}/staff`,
    data,
  );
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Payload for PATCH /admin/vendors/:id. Uses backend field names. */
export interface UpdateRetailerPayload {
  storeName?: string;
  email?: string;
  phone?: string;
  storeUrl?: string;
  description?: string;
  isOnline?: boolean;
  vendorCategory?: string;
  address?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  commissionPercentage?: number;
}

/** Update a vendor (retailer) by ID (partial update). */
export function updateRetailer(
  retailerId: string,
  data: Partial<UpdateRetailerPayload>,
): Promise<BackendVendor> {
  return api.patch<BackendVendor>(`admin/vendors/${retailerId}`, data);
}
