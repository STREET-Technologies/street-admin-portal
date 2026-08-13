import { api, toQueryString } from "@/lib/api-client";
import type { AddressValidationVerdict, PaginatedResponse } from "@/types";
import type { BackendVendor, RetailerListParams } from "../types";

export type { AddressValidationVerdict };

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
  return api.getPaginated<BackendVendor>(
    `admin/vendors${toQueryString(params)}`,
  );
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
  const orders = await api.get<RawVendorOrder[]>(
    `admin/vendors/${retailerId}/orders`,
  );
  return orders.map((raw) => ({
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
  /** Outlet the account is scoped to (TT-280/285). null = owner/HQ (sees all). */
  outletId: string | null;
  outletName: string | null;
  /** Admin-deactivated: cannot log into the retailer app (TT-295). */
  isAdminDisabled: boolean;
}

/** Fetch user accounts linked to a vendor (retailer staff). */
export function getRetailerStaff(
  retailerId: string,
): Promise<BackendVendorStaff[]> {
  return api.get<BackendVendorStaff[]>(`admin/vendors/${retailerId}/users`);
}

// ---------------------------------------------------------------------------
// Staff creation
// ---------------------------------------------------------------------------

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  /** Outlet to scope the account to (branch). Omit/undefined = owner/HQ. */
  outletId?: string;
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

/** Assign or clear a staff account's outlet (null = owner/HQ) (TT-285). */
export function setRetailerStaffOutlet(
  retailerId: string,
  userId: string,
  outletId: string | null,
): Promise<{ userId: string; outletId: string | null }> {
  return api.patch<{ userId: string; outletId: string | null }>(
    `admin/vendors/${retailerId}/staff/${userId}/outlet`,
    { outletId },
  );
}

/**
 * Reset a retailer login account's password (TT-295). The backend regenerates a
 * temp password and emails the set-password link — no credential is returned.
 */
export function resetRetailerStaffPassword(
  retailerId: string,
  userId: string,
): Promise<{ userId: string; email: string }> {
  return api.post<{ userId: string; email: string }>(
    `admin/vendors/${retailerId}/staff/${userId}/reset-password`,
    {},
  );
}

/** Deactivate/reactivate a retailer login account (TT-295). */
export function setRetailerStaffDisabled(
  retailerId: string,
  userId: string,
  disabled: boolean,
): Promise<{ userId: string; isAdminDisabled: boolean }> {
  return api.patch<{ userId: string; isAdminDisabled: boolean }>(
    `admin/vendors/${retailerId}/staff/${userId}/${disabled ? "disable" : "enable"}`,
    {},
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
  shippingReturnsUrl?: string;
}

/** Update a vendor (retailer) by ID (partial update). */
export function updateRetailer(
  retailerId: string,
  data: Partial<UpdateRetailerPayload>,
): Promise<BackendVendor> {
  return api.patch<BackendVendor>(`admin/vendors/${retailerId}`, data);
}

/**
 * Brand-level activate/deactivate (TT-355). Dedicated route — isActive is
 * deliberately not part of the general vendor PATCH payload.
 */
export function setRetailerActive(
  retailerId: string,
  isActive: boolean,
): Promise<BackendVendor> {
  return api.patch<BackendVendor>(`admin/vendors/${retailerId}/active`, {
    isActive,
  });
}

/**
 * Re-sync a vendor's store-level brand/contact/locale from Shopify (TT-315).
 *
 * Brand-asset changes (logo, cover image) and some profile edits fire no Shopify
 * webhook, so this gives staff a manual trigger. The backend asks the shopify-app
 * (which holds the access token) to re-fetch and push the latest to the vendor.
 * Store address is excluded — it syncs from the Shopify locations / outlet mirror.
 */
export function resyncRetailerFromShopify(
  retailerId: string,
): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(
    `admin/vendors/${retailerId}/resync-shopify`,
    {},
  );
}

// ---------------------------------------------------------------------------
// Outlets
// ---------------------------------------------------------------------------

/** Result of the backend's address validation check against the courier provider (TT-397). */
export type AddressValidationVerdict =
  | "valid"
  | "invalid_postcode"
  | "postcode_mismatch"
  | "unknown"
  | null;

/** Outlet (Shopify location) linked to a vendor. */
export interface AdminOutlet {
  id: string;
  name: string;
  address: string | null;
  address2: string | null;
  city: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  isPublished: boolean;
  isActive: boolean;
  isPrimary: boolean;
  /** Courier-bookability verdict for this outlet's address (TT-397). */
  addressValidationVerdict: AddressValidationVerdict;
  /** When the verdict was last computed. Null if never validated. */
  addressValidatedAt: string | null;
}

/**
 * Fetch outlets belonging to a specific vendor (retailer). Primary outlet first.
 *
 * Backend: GET /admin/vendors/:id/outlets → { data: AdminOutlet[] }
 * api.get unwraps the { data } envelope automatically → AdminOutlet[].
 */
export function getRetailerOutlets(
  retailerId: string,
): Promise<AdminOutlet[]> {
  return api.get<AdminOutlet[]>(`admin/vendors/${retailerId}/outlets`);
}

/** Toggle the published state of an outlet. */
export function setOutletPublished(
  retailerId: string,
  outletId: string,
  isPublished: boolean,
): Promise<AdminOutlet> {
  return api.patch<AdminOutlet>(
    `admin/vendors/${retailerId}/outlets/${outletId}/publish`,
    { isPublished },
  );
}

/** Toggle the active state of an outlet (pause/resume without unpublishing). */
export function setOutletActive(
  retailerId: string,
  outletId: string,
  isActive: boolean,
): Promise<AdminOutlet> {
  return api.patch<AdminOutlet>(
    `admin/vendors/${retailerId}/outlets/${outletId}/active`,
    { isActive },
  );
}

/**
 * Re-elect an outlet as the primary for a vendor.
 * No request body — backend derives everything from the outlet ID.
 * Also force-publishes the outlet and mirrors vendor address/coords.
 */
export function setOutletPrimary(
  retailerId: string,
  outletId: string,
): Promise<AdminOutlet> {
  return api.patch<AdminOutlet>(
    `admin/vendors/${retailerId}/outlets/${outletId}/primary`,
  );
}

// ---------------------------------------------------------------------------
// Billing health
// ---------------------------------------------------------------------------

/**
 * Mirrors BillingLedgerEntry in street-backend
 * (src/modules/v1/billing/interfaces/commission.interface.ts) — change together.
 */
export interface RetailerBillingLedgerEntry {
  orderId: string;
  createdAt: string;
  /** Order lifecycle status — context for the billing status. */
  orderStatus: string;
  /** Reason for the order's own status, e.g. "All items out of stock". */
  statusReason: string | null;
  paymentStatus: string;
  billingStatus: "pending" | "charged" | "failed" | "skipped";
  /** What Shopify was actually charged. Null until billed, and on legacy rows. */
  billingAmount: number | null;
  billingChargedAt: string | null;
  /** Set only when Shopify actually raised a usage charge. */
  billingUsageRecordId: string | null;
  /** Failure message when failed, skip reason when skipped — overloaded field. */
  billingError: string | null;
  discountAbsorbed: number | null;
  productTotal: number | null;
  commissionPercentage: number | null;
  commissionAmount: number | null;
  expectedDeliveryFee: number | null;
  expectedCharge: number | null;
}

export interface RetailerBillingHealth {
  shopDomain: string | null;
  subscription: {
    status: string | null;
    cappedAmount: number;
    billingCurrency: string | null;
    subscriptionId: string | null;
  } | null;
  orders: {
    pending: number;
    charged: number;
    failed: number;
    skipped: number;
    chargedAmount: number;
  };
  /** Most recent orders only — `ledgerTotal` is the true count. */
  ledger: RetailerBillingLedgerEntry[];
  ledgerTotal: number;
}

export function getRetailerBilling(
  retailerId: string,
  billingStatus?: string | null,
): Promise<RetailerBillingHealth> {
  return api.get<RetailerBillingHealth>(
    `admin/vendors/${retailerId}/billing${toQueryString({ billingStatus })}`,
  );
}
