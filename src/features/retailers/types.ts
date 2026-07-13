import type { EntityStatus } from "@/types";

// ---------------------------------------------------------------------------
// Backend shape (what the API returns -- uses "vendor" naming)
// ---------------------------------------------------------------------------

export interface BackendVendor {
  id: string;
  storeName: string;
  storeUrl: string | null;
  logo: string | null;
  description: string | null;
  vendorType: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  vendorCategory: string | null;
  commissionPercentage: number | null;
  isOnline: boolean;
  isActive: boolean;
  /**
   * Set when the store uninstalled the Shopify app. Admin-only, visible during
   * the 48h grace window before backend redaction. Null = installed. (TT-317)
   */
  uninstalledAt: string | null;
  stripeAccountId: string | null;
  shippingReturnsUrl: string | null;
  openingHours: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Frontend view model (user-facing "retailer" naming)
// ---------------------------------------------------------------------------

export interface RetailerViewModel {
  id: string;
  /** Display name -- mapped from `storeName`. */
  name: string;
  email: string;
  phone: string;
  status: EntityStatus;
  category: string;
  commissionPercentage: number | null;
  storeUrl: string | null;
  shippingReturnsUrl: string | null;
  address: string;
  postcode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  stripeAccountId: string | null;
  logo: string | null;
  isOnline: boolean;
  /** Brand-level discovery gate — false hides the whole brand (TT-284/355). */
  isActive: boolean;
  /** ISO timestamp the store uninstalled the Shopify app, or null. (TT-317) */
  uninstalledAt: string | null;
  openingHours: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

function deriveStatus(
  isActive: boolean,
  isOnline: boolean,
  uninstalledAt: string | null,
): EntityStatus {
  // Uninstall takes precedence — isActive/isOnline are left untouched by the
  // uninstall flow, so without this an uninstalled store would read as active.
  if (uninstalledAt) return "uninstalled";
  if (!isActive) return "blocked";
  return isOnline ? "active" : "inactive";
}

// ---------------------------------------------------------------------------
// Transform: BackendVendor -> RetailerViewModel
// ---------------------------------------------------------------------------

export function toRetailerViewModel(vendor: BackendVendor): RetailerViewModel {
  return {
    id: vendor.id,
    name: vendor.storeName,
    email: vendor.email ?? "",
    phone: vendor.phone ?? "",
    status: deriveStatus(vendor.isActive, vendor.isOnline, vendor.uninstalledAt),
    category: vendor.vendorCategory ?? "Uncategorized",
    commissionPercentage: vendor.commissionPercentage,
    storeUrl: vendor.storeUrl,
    shippingReturnsUrl: vendor.shippingReturnsUrl,
    address: vendor.address ?? "",
    postcode: vendor.postcode ?? "",
    country: vendor.country ?? "",
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    description: vendor.description ?? "",
    stripeAccountId: vendor.stripeAccountId,
    logo: vendor.logo ?? null,
    isOnline: vendor.isOnline,
    isActive: vendor.isActive,
    uninstalledAt: vendor.uninstalledAt,
    openingHours: vendor.openingHours,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Retailer list params (maps to backend /admin/vendors query params)
// ---------------------------------------------------------------------------

/** Derived status filter (matches deriveStatus / the badge shown per row). */
export type RetailerStatusFilter =
  | "active"
  | "inactive"
  | "blocked"
  | "uninstalled";

export interface RetailerListParams {
  name?: string;
  vendorCategory?: string;
  /** Server-side derived status filter. */
  status?: RetailerStatusFilter;
  /** Backend allowlist: name | email | createdAt */
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
