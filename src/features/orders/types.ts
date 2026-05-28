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
  shopifyOrderId?: string | null;
  // Flat fields from global list raw query (not present on detail endpoint)
  itemCount?: number | null;
  /**
   * Reconciliation attempts from delivery_state (TT-166). 0 for orders that
   * never had a Stuart delivery or whose webhooks arrived normally. >0 means
   * the cron is/was attempting to recover the delivery; >=12 means it gave up.
   */
  reconciliationAttempts?: number | null;
  // TT-226 — returns sync from Shopify
  returnStatus?: string | null;
  totalShippingRefundedAmount?: string | number | null;
  returns?: BackendReturn[] | null;
}

/** Return record attached to an order (TT-226). */
export interface BackendReturn {
  id: string;
  shopifyReturnId: string;
  status: string;
  customerNote?: string | null;
  refundAmount?: string | number | null;
  refundedAmount?: string | number | null;
  shippingRefundAmount?: string | number | null;
  currency?: string | null;
  closedAt?: string | null;
  createdAt: string;
  lineItems?: BackendReturnLineItem[];
}

export interface BackendReturnLineItem {
  id: string;
  quantity: number;
  reason: string;
  condition: string;
  restockType?: string | null;
  customerNote?: string | null;
  orderItem?: { id: string } | null;
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
  /** Reconciliation attempts (TT-166) — drives the "stuck delivery" badge in the list view. */
  reconciliationAttempts: number;
  // Enriched fields for detail view
  retailerName?: string;
  retailerId?: string;
  userId?: string;
  paymentStatus?: string;
  /**
   * Return state on the underlying order (TT-226). NONE when no return exists.
   */
  returnStatus: string;
  /**
   * Consolidated UI status — supersedes `status` for display when a return is
   * active or completed. Use this for header pills + list status columns.
   * Examples: DELIVERED, RETURNED, PARTIALLY_RETURNED, RETURN_REQUESTED.
   */
  displayStatus: string;
}

// ---------------------------------------------------------------------------
// Detail view models
// ---------------------------------------------------------------------------

/** Extended order view model for the detail page. */
export interface OrderDetailViewModel extends OrderViewModel {
  shopifyOrderId: string | null;
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
    isShopifyOrder: boolean;
  } | null;
  /** TT-226 — return state and per-return details */
  returnStatus: string;
  totalShippingRefundedAmount: number;
  totalShippingRefundedFormatted: string | null;
  returns: ReturnViewModel[];
}

/** Transformed Return record for the detail page (TT-226). */
export interface ReturnViewModel {
  id: string;
  shopifyReturnId: string;
  status: string;
  customerNote: string | null;
  refundedAmount: number;
  refundedAmountFormatted: string;
  shippingRefundAmount: number;
  shippingRefundAmountFormatted: string | null;
  currency: string;
  closedAt: string | null;
  createdAt: string;
  lineItems: {
    id: string;
    orderItemId: string | null;
    quantity: number;
    reason: string;
    condition: string;
  }[];
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
  /**
   * Quantity of this line item returned across all closed returns (TT-226).
   * 0 = not returned, == quantity = fully returned, between = partial.
   */
  returnedQuantity: number;
  /** Aggregated reason from the most recent return on this item, if any. */
  returnReason: string | null;
}

// ---------------------------------------------------------------------------
// Transform: BackendOrder -> OrderViewModel
// ---------------------------------------------------------------------------

/**
 * Consolidate order status + return status into a single display status (TT-226).
 *
 * When a return is active or completed it supersedes the original status for
 * UI purposes — a returned order should show as RETURNED in the pill, not
 * DELIVERED. Declined/cancelled returns fall through to the original status.
 */
export function deriveDisplayStatus(
  orderStatus: string | undefined,
  returnStatus: string | undefined,
): string {
  const order = (orderStatus ?? "").toUpperCase();
  const ret = (returnStatus ?? "NONE").toUpperCase();

  switch (ret) {
    case "REQUESTED":
      return "RETURN_REQUESTED";
    case "IN_PROGRESS":
      return "RETURN_IN_PROGRESS";
    case "PARTIAL":
      return "PARTIALLY_RETURNED";
    case "COMPLETE":
      return "RETURNED";
    case "NONE":
    case "DECLINED":
    case "CANCELLED":
    default:
      return order;
  }
}

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

  const returnStatus = backend.returnStatus ?? "NONE";
  const displayStatus = deriveDisplayStatus(backend.status, returnStatus);

  return {
    id: backend.id,
    orderId: backend.orderId ?? backend.id.slice(0, 8),
    customerName: name,
    customerEmail: email,
    status: backend.status?.toLowerCase() ?? "unknown",
    totalAmount: formatGBP(backend.totalAmount),
    totalAmountRaw: typeof backend.totalAmount === "string" ? parseFloat(backend.totalAmount) : backend.totalAmount,
    itemCount: backend.itemCount ?? backend.orderItems?.length ?? 0,
    createdAt: backend.createdAt,
    reconciliationAttempts: backend.reconciliationAttempts ?? 0,
    retailerName: backend.vendor?.storeName ?? backend.vendorName,
    retailerId: backend.vendor?.id ?? backend.vendorId,
    userId: backend.user?.id ?? backend.customerId ?? undefined,
    paymentStatus: backend.paymentStatus?.toLowerCase(),
    returnStatus,
    displayStatus,
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
function toItemViewModel(
  item: BackendOrderItem,
  index: number,
  returnAggregates?: {
    returnedQuantity: number;
    returnReason: string | null;
  },
): OrderItemViewModel {
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
    returnedQuantity: returnAggregates?.returnedQuantity ?? 0,
    returnReason: returnAggregates?.returnReason ?? null,
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

  // TT-226 — aggregate per-item return state from all returns + return line items.
  // Excludes DECLINED/CANCELLED returns since they didn't result in items returned.
  const returnAggregatesByOrderItem = new Map<
    string,
    { returnedQuantity: number; returnReason: string | null }
  >();
  for (const r of backend.returns ?? []) {
    const status = (r.status ?? "").toUpperCase();
    if (status === "DECLINED" || status === "CANCELLED" || status === "CANCELED") {
      continue;
    }
    for (const line of r.lineItems ?? []) {
      const orderItemId = line.orderItem?.id;
      if (!orderItemId) continue;
      const existing = returnAggregatesByOrderItem.get(orderItemId) ?? {
        returnedQuantity: 0,
        returnReason: null,
      };
      existing.returnedQuantity += line.quantity ?? 0;
      // Take the first non-UNKNOWN reason we see — close-enough display heuristic.
      if (!existing.returnReason && line.reason && line.reason !== "UNKNOWN") {
        existing.returnReason = line.reason;
      }
      returnAggregatesByOrderItem.set(orderItemId, existing);
    }
  }

  // Items
  const items = (backend.orderItems ?? []).map((item, idx) =>
    toItemViewModel(
      item,
      idx,
      item.id ? returnAggregatesByOrderItem.get(item.id) : undefined,
    ),
  );

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
  const isShopifyOrder =
    !!backend.shopifyOrderId ||
    backend.paymentMethod === 'shopify_checkout' ||
    pb?.shopifyCheckout === true;
  const pricing = pb
    ? {
        subtotal: formatGBP((pb.items as number) ?? backend.subtotal),
        deliveryFee: formatGBP(pb.deliveryFee as number | null),
        serviceFee: formatGBP(pb.serviceFee as number | null),
        total: formatGBP((pb.total as number) ?? backend.totalAmount),
        isShopifyOrder,
      }
    : null;

  // TT-226 — returns
  const totalShippingRefunded =
    typeof backend.totalShippingRefundedAmount === "string"
      ? parseFloat(backend.totalShippingRefundedAmount)
      : (backend.totalShippingRefundedAmount ?? 0);
  const totalShippingRefundedFormatted =
    totalShippingRefunded > 0 ? formatGBP(totalShippingRefunded) : null;

  const returns: ReturnViewModel[] = (backend.returns ?? []).map((r) => {
    const refunded =
      typeof r.refundedAmount === "string"
        ? parseFloat(r.refundedAmount)
        : (r.refundedAmount ?? 0);
    const shippingRefund =
      typeof r.shippingRefundAmount === "string"
        ? parseFloat(r.shippingRefundAmount)
        : (r.shippingRefundAmount ?? 0);
    return {
      id: r.id,
      shopifyReturnId: r.shopifyReturnId,
      status: r.status,
      customerNote: r.customerNote ?? null,
      refundedAmount: refunded,
      refundedAmountFormatted: formatGBP(refunded),
      shippingRefundAmount: shippingRefund,
      shippingRefundAmountFormatted:
        shippingRefund > 0 ? formatGBP(shippingRefund) : null,
      currency: r.currency ?? "GBP",
      closedAt: r.closedAt ?? null,
      createdAt: r.createdAt,
      lineItems: (r.lineItems ?? []).map((li) => ({
        id: li.id,
        orderItemId: li.orderItem?.id ?? null,
        quantity: li.quantity,
        reason: li.reason,
        condition: li.condition,
      })),
    };
  });

  return {
    ...base,
    shopifyOrderId: backend.shopifyOrderId ?? null,
    customer,
    retailer,
    items,
    payment,
    delivery,
    shippingAddress,
    pricing,
    returnStatus: backend.returnStatus ?? "NONE",
    totalShippingRefundedAmount: totalShippingRefunded,
    totalShippingRefundedFormatted,
    returns,
  };
}
