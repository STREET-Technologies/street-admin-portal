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

/** Fetch a paginated list of users. Uses getRaw to preserve meta. */
export async function getUsers(
  params: GetUsersParams = {},
): Promise<PaginatedResponse<BackendUser>> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `admin/users?${query}` : "admin/users";

  return api.getRaw<PaginatedResponse<BackendUser>>(endpoint);
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

/** Fetch orders for a user. */
export async function getUserOrders(
  userId: string,
): Promise<BackendUserOrder[]> {
  return api.get<BackendUserOrder[]>(`admin/users/${userId}/orders`);
}

/** Fetch devices for a user. */
export async function getUserDevices(
  userId: string,
): Promise<BackendUserDevice[]> {
  return api.get<BackendUserDevice[]>(`admin/users/${userId}/devices`);
}
