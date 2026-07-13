/**
 * Shared base types used across multiple features.
 *
 * Feature-specific types (User, Retailer, etc.) belong in their
 * respective feature folders, not here.
 */

// ---------------------------------------------------------------------------
// Status types (string literal unions, not enums)
// ---------------------------------------------------------------------------

/** General entity status used for users and retailers. */
export type EntityStatus =
  | "active"
  | "inactive"
  | "blocked"
  | "pending"
  | "suspended"
  | "uninstalled";

/**
 * Lifecycle status of an order. Mirrors the backend OrderStatus enum —
 * values are UPPERCASE and must match exactly (filters are string equality).
 */
export type OrderStatus =
  | "PENDING"
  | "AWAITING_ACCEPTANCE"
  | "CONFIRMED"
  | "IN_PACKING"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNING"
  | "RETURNED"
  | "PAYMENT_CANCELLED"
  | "PAYMENT_FAILED";

/** Payment status for an order or transaction. */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Priority level for admin notes attached to entities. */
export type NotePriority = "low" | "medium" | "high" | "urgent";

/** Top-level entity categories in the admin portal. */
export type EntityType = "user" | "retailer" | "order";

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

/** Standard paginated response wrapper returned by the backend. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Shape of error responses returned by the backend. */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

// ---------------------------------------------------------------------------
// Base entity
// ---------------------------------------------------------------------------

/** Fields shared by every persisted entity. */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
