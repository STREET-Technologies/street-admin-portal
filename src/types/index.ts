/**
 * Shared base types used across multiple features.
 *
 * Feature-specific types (User, Retailer, etc.) belong in their
 * respective feature folders, not here.
 */

// ---------------------------------------------------------------------------
// Status types (string literal unions, not enums)
// ---------------------------------------------------------------------------

/** General entity status used for users, retailers, couriers. */
export type EntityStatus =
  | "active"
  | "inactive"
  | "blocked"
  | "pending"
  | "suspended";

/** Lifecycle status of an order. */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "in_delivery"
  | "delivered"
  | "cancelled";

/** Payment status for an order or transaction. */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Priority level for admin notes attached to entities. */
export type NotePriority = "low" | "medium" | "high" | "urgent";

/** Top-level entity categories in the admin portal. */
export type EntityType = "user" | "retailer" | "courier" | "order";

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
