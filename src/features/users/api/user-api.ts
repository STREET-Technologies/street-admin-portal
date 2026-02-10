import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type {
  BackendUser,
  BackendUserAddress,
  BackendUserDevice,
  BackendUserOrder,
} from "../types";

// ---------------------------------------------------------------------------
// Request params
// ---------------------------------------------------------------------------

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Backend envelope for GET /admin/users (after ResponseInterceptor).
 * Shape: { statusCode, message, data: { users, total, page, limit } }
 */
interface UsersRawResponse {
  data: { users: BackendUser[]; total: number; page: number; limit: number };
}

/** Fetch a paginated list of users. Normalizes to PaginatedResponse. */
export async function getUsers(
  params: GetUsersParams = {},
): Promise<PaginatedResponse<BackendUser>> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `admin/users?${query}` : "admin/users";

  const raw = await api.getRaw<UsersRawResponse>(endpoint);
  const { users, total, page, limit } = raw.data;
  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Fetch a single user by ID. */
export async function getUser(userId: string): Promise<BackendUser> {
  return api.get<BackendUser>(`admin/users/${userId}`);
}

/** Fetch addresses for a user. */
export async function getUserAddresses(
  userId: string,
): Promise<BackendUserAddress[]> {
  return api.get<BackendUserAddress[]>(`admin/users/${userId}/addresses`);
}

/** Raw order shape from backend (nested vendor relation, string amounts). */
interface RawUserOrder {
  id: string;
  orderId: string;
  status: string;
  totalAmount: string | number | null;
  vendorId?: string;
  vendor?: { id: string; storeName?: string };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

/** Fetch orders for a user. Backend returns { orders, meta }. Flattens vendor relation. */
export async function getUserOrders(
  userId: string,
): Promise<BackendUserOrder[]> {
  const data = await api.get<{ orders: RawUserOrder[] }>(
    `admin/users/${userId}/orders`,
  );
  return data.orders.map((raw) => ({
    id: raw.id,
    orderNumber: raw.orderId ?? null,
    status: raw.status,
    totalAmount: raw.totalAmount != null ? Number(raw.totalAmount) : null,
    currency: null,
    retailerId: raw.vendor?.id ?? raw.vendorId ?? null,
    retailerName: raw.vendor?.storeName ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }));
}

/** Fetch devices for a user. */
export async function getUserDevices(
  userId: string,
): Promise<BackendUserDevice[]> {
  return api.get<BackendUserDevice[]>(`admin/users/${userId}/devices`);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Payload for PATCH /admin/users/:id. */
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  language?: string;
}

/** Update a user by ID (partial update). */
export async function updateUser(
  userId: string,
  data: Partial<UpdateUserPayload>,
): Promise<BackendUser> {
  return api.patch<BackendUser>(`admin/users/${userId}`, data);
}
