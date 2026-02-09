import type { OrderStatus } from "@/types";

// ---------------------------------------------------------------------------
// Backend shapes (what the API returns)
// ---------------------------------------------------------------------------

/** Order entity as returned by GET /admin/vendors/:id/orders. */
export interface BackendOrder {
  id: string;
  orderId: string; // ST-XXXXX display ID
  customerId: string | null;
  customerName: string | null;
  customerEmail?: string | null;
  status: string;
  totalAmount: number | null;
  subtotal?: number | null;
  createdAt: string;
  updatedAt?: string;
  items: BackendOrderItem[];
  // Fields from findOrderByOrderIdWithRelations
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  vendor?: {
    id: string;
    storeName: string;
    logo?: string;
  } | null;
  deliveryDetails?: Record<string, unknown> | null;
  shippingAddress?: Record<string, unknown> | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  pricingBreakdown?: Record<string, unknown> | null;
  payments?: BackendPayment[] | null;
  stuartJobId?: string | null;
}

/** Individual item within an order. */
export interface BackendOrderItem {
  id?: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  metadata?: Record<string, unknown> | null;
}

/** Payment record attached to an order. */
export interface BackendPayment {
  id: string;
  status: string;
  provider: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  refundedAmount?: number | null;
}

// ---------------------------------------------------------------------------
// Frontend view model (what components consume)
// ---------------------------------------------------------------------------

/** Transformed order for display in list and detail views. */
export interface OrderViewModel {
  id: string;
  orderId: string; // ST-XXXXX display format
  customerName: string;
  customerEmail: string;
  status: OrderStatus | string;
  totalAmount: string; // Formatted currency string
  totalAmountRaw: number | null; // Raw for sorting
  itemCount: number;
  createdAt: string;
  // Enriched fields for detail view
  retailerName?: string;
  retailerId?: string;
  userId?: string;
  paymentStatus?: string;
}

// ---------------------------------------------------------------------------
// Transform: BackendOrder -> OrderViewModel
// ---------------------------------------------------------------------------

/** Format an amount in pence as GBP currency string. */
function formatGBP(amountPence: number | null): string {
  if (amountPence == null) return "--";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountPence / 100);
}

/** Transform a BackendOrder into an OrderViewModel for UI consumption. */
export function toOrderViewModel(backend: BackendOrder): OrderViewModel {
  const name =
    backend.customerName ??
    (backend.user
      ? `${backend.user.firstName} ${backend.user.lastName}`.trim()
      : "Unknown");

  const email =
    backend.customerEmail ?? backend.user?.email ?? "No email";

  return {
    id: backend.id,
    orderId: backend.orderId ?? backend.id.slice(0, 8),
    customerName: name,
    customerEmail: email,
    status: backend.status?.toLowerCase() ?? "unknown",
    totalAmount: formatGBP(backend.totalAmount),
    totalAmountRaw: backend.totalAmount,
    itemCount: backend.items?.length ?? 0,
    createdAt: backend.createdAt,
    retailerName: backend.vendor?.storeName,
    retailerId: backend.vendor?.id,
    userId: backend.user?.id ?? backend.customerId ?? undefined,
    paymentStatus: backend.paymentStatus?.toLowerCase(),
  };
}
