import type { OrderStatus } from "@/types";

// ---------------------------------------------------------------------------
// Backend shapes (what the API returns)
// ---------------------------------------------------------------------------

/** Order entity as returned by admin endpoints. */
export interface BackendOrder {
  id: string;
  orderId: string; // ST-XXXXX display ID
  customerId: string | null;
  customerName: string | null;
  customerEmail?: string | null;
  status: string;
  totalAmount: string | number | null;
  subtotal?: string | number | null;
  createdAt: string;
  updatedAt?: string;
  orderItems: BackendOrderItem[];
  // Fields from findOrderByOrderIdWithRelations (detail endpoint)
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
  // Flat fields from global orders list endpoint (raw query)
  vendorId?: string;
  vendorName?: string;
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
  price: string | number;
  totalPrice: string | number;
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
// Detail view models
// ---------------------------------------------------------------------------

/** Extended order view model for the detail page. */
export interface OrderDetailViewModel extends OrderViewModel {
  /** Customer info */
  customer: {
    id: string | null;
    name: string;
    email: string;
    phone: string;
  };
  /** Retailer (vendor) info */
  retailer: {
    id: string;
    name: string;
    logo?: string;
  } | null;
  /** Line items */
  items: OrderItemViewModel[];
  /** Payment info */
  payment: {
    status: string;
    method: string;
    amount: string;
    refundedAmount: string | null;
  } | null;
  /** Delivery / courier info from deliveryDetails JSONB */
  delivery: {
    status: string;
    courierName: string | null;
    courierPhone: string | null;
    courierPhoto: string | null;
    vehicleType: string | null;
    trackingUrl: string | null;
    estimatedDelivery: string | null;
  } | null;
  /** Shipping address from shippingAddress JSONB */
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  } | null;
  /** Pricing breakdown from pricingBreakdown JSONB */
  pricing: {
    subtotal: string;
    deliveryFee: string;
    serviceFee: string;
    total: string;
  } | null;
}

/** Transformed order line item for display. */
export interface OrderItemViewModel {
  id: string;
  productName: string;
  variant: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  imageUrl: string | null;
  packingStatus: string | null;
}

// ---------------------------------------------------------------------------
// Transform: BackendOrder -> OrderViewModel
// ---------------------------------------------------------------------------

/** Format a GBP amount (in pounds) as a currency string. */
function formatGBP(amount: string | number | null | undefined): string {
  if (amount == null) return "--";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "--";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(num);
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
    totalAmountRaw: typeof backend.totalAmount === "string" ? parseFloat(backend.totalAmount) : backend.totalAmount,
    itemCount: backend.orderItems?.length ?? 0,
    createdAt: backend.createdAt,
    retailerName: backend.vendor?.storeName ?? backend.vendorName,
    retailerId: backend.vendor?.id ?? backend.vendorId,
    userId: backend.user?.id ?? backend.customerId ?? undefined,
    paymentStatus: backend.paymentStatus?.toLowerCase(),
  };
}

// ---------------------------------------------------------------------------
// Transform: BackendOrder -> OrderDetailViewModel
// ---------------------------------------------------------------------------

/** Safely extract a string from a Record. */
function str(obj: Record<string, unknown> | null | undefined, key: string): string | null {
  if (!obj) return null;
  const val = obj[key];
  return typeof val === "string" ? val : null;
}

/** Transform a BackendOrderItem into an OrderItemViewModel. */
function toItemViewModel(item: BackendOrderItem, index: number): OrderItemViewModel {
  const meta = item.metadata as Record<string, unknown> | null | undefined;

  // Extract first image from images array: [{src, ...}, ...]
  const images = meta?.images as Array<{ src?: string }> | undefined;
  const imageUrl = images?.[0]?.src ?? null;

  // Packing status lives in packingState.status
  const packingState = meta?.packingState as Record<string, unknown> | undefined;

  return {
    id: item.id ?? `item-${index}`,
    productName: (meta?.productName as string) ?? `Product ${item.productId.slice(0, 8)}`,
    variant: (meta?.title as string) ?? "--",
    sku: (meta?.sku as string) ?? "--",
    quantity: item.quantity,
    unitPrice: formatGBP(item.price),
    totalPrice: formatGBP(item.totalPrice),
    imageUrl,
    packingStatus: (packingState?.status as string) ?? null,
  };
}

/** Transform a BackendOrder into an OrderDetailViewModel for the detail page. */
export function toOrderDetailViewModel(backend: BackendOrder): OrderDetailViewModel {
  const base = toOrderViewModel(backend);

  // Customer
  const customer = {
    id: backend.user?.id ?? backend.customerId ?? null,
    name: base.customerName,
    email: base.customerEmail,
    phone: backend.user?.phone ?? "No phone",
  };

  // Retailer
  const retailer = backend.vendor
    ? {
        id: backend.vendor.id,
        name: backend.vendor.storeName,
        logo: backend.vendor.logo,
      }
    : null;

  // Items
  const items = (backend.orderItems ?? []).map(toItemViewModel);

  // Payment (prefer payments array, fall back to top-level fields)
  const primaryPayment = backend.payments?.[0];
  const payment = primaryPayment
    ? {
        status: primaryPayment.status.toLowerCase(),
        method: primaryPayment.provider,
        amount: formatGBP(primaryPayment.amount),
        refundedAmount: primaryPayment.refundedAmount
          ? formatGBP(primaryPayment.refundedAmount)
          : null,
      }
    : backend.paymentStatus
      ? {
          status: backend.paymentStatus.toLowerCase(),
          method: backend.paymentMethod ?? "Unknown",
          amount: base.totalAmount,
          refundedAmount: null,
        }
      : null;

  // Delivery details from JSONB
  const dd = backend.deliveryDetails as Record<string, unknown> | null | undefined;
  const courier = dd?.courier as Record<string, unknown> | null | undefined;
  const delivery = dd
    ? {
        status: (str(dd, "deliveryStatus") ?? str(dd, "status") ?? "unknown").toLowerCase(),
        courierName: courier ? str(courier, "name") : null,
        courierPhone: courier ? str(courier, "phone") : null,
        courierPhoto: courier ? (str(courier, "pictureUrl") ?? str(courier, "photoUrl")) : null,
        vehicleType: courier ? str(courier, "transportType") : null,
        trackingUrl: str(dd, "trackingUrl"),
        estimatedDelivery: str(dd, "estimatedDeliveryTime"),
      }
    : null;

  // Shipping address from JSONB
  const sa = backend.shippingAddress as Record<string, unknown> | null | undefined;
  const shippingAddress = sa
    ? {
        line1: str(sa, "address1") ?? str(sa, "line1") ?? "Unknown",
        line2: str(sa, "address2") ?? str(sa, "line2") ?? undefined,
        city: str(sa, "city") ?? "Unknown",
        postcode: str(sa, "zip") ?? str(sa, "postcode") ?? "Unknown",
        country: str(sa, "country") ?? "United Kingdom",
      }
    : null;

  // Pricing breakdown from JSONB
  const pb = backend.pricingBreakdown as Record<string, unknown> | null | undefined;
  const pricing = pb
    ? {
        subtotal: formatGBP((pb.items as number) ?? backend.subtotal),
        deliveryFee: formatGBP(pb.deliveryFee as number | null),
        serviceFee: formatGBP(pb.serviceFee as number | null),
        total: formatGBP((pb.total as number) ?? backend.totalAmount),
      }
    : null;

  return {
    ...base,
    customer,
    retailer,
    items,
    payment,
    delivery,
    shippingAddress,
    pricing,
  };
}
