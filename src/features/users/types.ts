import type { EntityStatus } from "@/types";

// ---------------------------------------------------------------------------
// Backend shapes (what the API returns)
// ---------------------------------------------------------------------------

/** User entity as returned by the backend API. */
export interface BackendUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  language: string | null;
  role: string;
  ssoProvider: string | null;
  isTestAccount: boolean;
  isAnonymized: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Address entity as returned by GET /admin/users/:id/addresses. */
export interface BackendUserAddress {
  id: string;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Device entity as returned by GET /admin/users/:id/devices (FcmToken entity). */
export interface BackendUserDevice {
  id: string;
  token: string;
  platform: "web" | "ios" | "android";
  deviceName: string | null;
  deviceId: string | null;
  recipientType: "vendor" | "user";
  isActive: boolean;
  lastUsedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** Order entity as returned by GET /admin/users/:id/orders. */
export interface BackendUserOrder {
  id: string;
  orderNumber: string | null;
  status: string;
  totalAmount: number | null;
  currency: string | null;
  retailerId: string | null;
  retailerName: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Frontend view models (what components consume)
// ---------------------------------------------------------------------------

/** Transformed user for display in list and detail views. */
export interface UserViewModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: EntityStatus;
  avatarUrl: string | null;
  role: string;
  ssoProvider: string | null;
  language: string | null;
  isTestAccount: boolean;
  isAnonymized: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

/** Build a display name from nullable first/last name fields. */
function buildDisplayName(
  firstName: string | null,
  lastName: string | null,
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown";
}

/** Transform a BackendUser into a UserViewModel for UI consumption. */
export function toUserViewModel(backend: BackendUser): UserViewModel {
  return {
    id: backend.id,
    name: buildDisplayName(backend.firstName, backend.lastName),
    email: backend.email ?? "No email",
    phone: backend.phone ?? "No phone",
    status: "active" as EntityStatus, // Backend has no status field
    avatarUrl: backend.profileImage,
    role: backend.role,
    ssoProvider: backend.ssoProvider,
    language: backend.language,
    isTestAccount: backend.isTestAccount,
    isAnonymized: backend.isAnonymized,
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
  };
}
