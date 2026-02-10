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
  stripeAccountId: string | null;
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
  logoUrl: string | null;
  commissionPercentage: number | null;
  storeUrl: string | null;
  address: string;
  postcode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  stripeAccountId: string | null;
  isOnline: boolean;
  openingHours: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

function deriveStatus(isActive: boolean, isOnline: boolean): EntityStatus {
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
    status: deriveStatus(vendor.isActive, vendor.isOnline),
    category: vendor.vendorCategory ?? "Uncategorized",
    logoUrl: vendor.logo,
    commissionPercentage: vendor.commissionPercentage,
    storeUrl: vendor.storeUrl,
    address: vendor.address ?? "",
    postcode: vendor.postcode ?? "",
    country: vendor.country ?? "",
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    description: vendor.description ?? "",
    stripeAccountId: vendor.stripeAccountId,
    isOnline: vendor.isOnline,
    openingHours: vendor.openingHours,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Retailer list params (maps to backend /admin/vendors query params)
// ---------------------------------------------------------------------------

export interface RetailerListParams {
  name?: string;
  vendorCategory?: string;
  page?: number;
  limit?: number;
}
