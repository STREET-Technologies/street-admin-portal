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
  /** Relation, present on the detail + retailer-tab responses (TT-449). */
  outlet?: {
    id: string;
    name: string;
  } | null;
  // Flat fields from global orders list endpoint (raw query)
  vendorId?: string;
  vendorName?: string;
  outletId?: string | null;
  outletName?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  pricingBreakdown?: Record<string, unknown> | null;
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
  // TT-473 — refunds. `refundState` is derived on the backend from the money
  // (never stored, never from paymentStatus); `refunds` are the per-refund
  // rows, oldest first, present on the detail endpoint only.
  totalRefundedAmount?: string | number | null;
  refundState?: RefundState | null;
  refunds?: BackendOrderRefund[] | null;
  // TT-477 — Shopify's own words, verbatim from the latest order webhook.
  shopifyFinancialStatus?: string | null;
  shopifyFulfillmentStatus?: string | null;
  shopifyStatusAt?: string | null;
}

/** NONE / PARTIAL / FULL, computed by the backend (TT-469/473). */
export type RefundState = "NONE" | "PARTIAL" | "FULL";

/** One `order_refunds` row (TT-469). */
export interface BackendOrderRefund {
  id: string;
  /** Set when the refund settled a customer Return; null on retailer refunds. */
  returnId: string | null;
  refundedAmount: string | number;
  shippingRefundAmount: string | number;
  /** Retailer/staff text on the refund itself. Null on Return-linked refunds. */
  note: string | null;
  refundedAt: string;
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
  /**
   * Branch the order was placed against (TT-449). Null on orders predating
   * outlet attribution (TT-366), which is a real gap in the data rather
   * than a missing field.
   */
  outletName?: string | null;
  outletId?: string | null;
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
  /** TT-473 — backend-derived; NONE when nothing has been refunded. */
  refundState: RefundState;
  /** Formatted refund total ("£98.00"), null when nothing has been refunded. */
  totalRefundedFormatted: string | null;
  /**
   * TT-477 — what Shopify itself last said about this order. Support has no
   * access to the retailer's store in production, so this is the line they
   * read to a customer; the retailer sees the same in Shopify admin. Null
   * when Shopify has never told us. `disagreesWithRefundState` is a bug
   * signal for us (our derived state vs Shopify's words), never hidden.
   */
  shopifySays: ShopifySays | null;
}

export interface ShopifySays {
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  at: string;
  /** "partially_refunded · fulfilled" */
  label: string;
  disagreesWithRefundState: boolean;
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
  /** Payment info (capture status + rail; refunds live on `refunds`). */
  payment: {
    status: string;
    method: string;
  } | null;
  /** Shipping address from shippingAddress JSONB */
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  } | null;
  /**
   * Pricing breakdown from pricingBreakdown JSONB. Mirrors Shopify's summary
   * (TT-471): `total` is the order as it stands now (goods remaining + fees −
   * discount); `paid` is what was charged (`totalAmount`, never shrinks);
   * `netPaid` is paid − refunded, present only when money came back.
   */
  pricing: {
    subtotal: string;
    deliveryFee: string;
    serviceFee: string;
    /** Formatted discount (e.g. "£5.00"), or null when no code was used. */
    discount: string | null;
    total: string;
    paid: string;
    netPaid: string | null;
    isShopifyOrder: boolean;
  } | null;
  /** TT-226 — return state and per-return details */
  returnStatus: string;
  totalShippingRefundedAmount: number;
  totalShippingRefundedFormatted: string | null;
  returns: ReturnViewModel[];
  /**
   * TT-473 — one merged timeline of refunds and returns, oldest first. A
   * refunded Return appears once, on its refund; only a Return with no refund
   * yet gets its own entry.
   */
  refundEvents: RefundEvent[];
}

/** The Return behind an event, resolved to product names for display. */
export interface ReturnSummary {
  shopifyReturnId: string;
  status: string;
  customerNote: string | null;
  lineItems: {
    id: string;
    quantity: number;
    productName: string;
    condition: string;
  }[];
}

/**
 * One row of the Refunds & returns section (TT-473). On a refund, `reason`
 * names its author: a standalone refund carries the retailer's note; a
 * Return-linked refund carries the customer's line-item reasons from the
 * loaded Return. Null only when a standalone refund genuinely has no note.
 */
export type RefundEvent =
  | {
      kind: "refund";
      id: string;
      date: string;
      amountFormatted: string;
      /** Shipping portion, when any — already paid out to the courier. */
      shippingFormatted: string | null;
      reason: { source: "retailer" | "customer"; text: string | null } | null;
      return: ReturnSummary | null;
    }
  | {
      kind: "return";
      id: string;
      date: string;
      return: ReturnSummary;
    };

/** Per-line settlement, shown as a plain label in the items table (TT-473). */
export type LineStatus = "PAID" | "REFUNDED" | "RETURNED";

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
  /** Real variant name (e.g. "Large") — from metadata.variantTitle, not the product title. */
  variant: string;
  variantId: string | null;
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
  /**
   * TT-473 — RETURNED when any quantity came back; REFUNDED when the retailer
   * removed it at acceptance (packingState cancelled) or the whole order was
   * refunded; otherwise PAID.
   */
  lineStatus: LineStatus;
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
/**
 * Render optionValues as "Regular / 4" regardless of stored shape:
 * plain strings, or {value} objects from the variant_option_values relation.
 * Returns null when nothing renderable so callers can fall through to "--".
 */
export function formatOptionValues(optionValues: unknown): string | null {
  if (!Array.isArray(optionValues)) return null;
  const parts = optionValues
    .map((v) =>
      typeof v === "string" ? v : ((v as { value?: unknown })?.value ?? null),
    )
    .filter((v): v is string => typeof v === "string" && v.length > 0);
  return parts.length ? parts.join(" / ") : null;
}

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

  const email = backend.customerEmail ?? backend.user?.email ?? "No email";

  const returnStatus = backend.returnStatus ?? "NONE";
  const displayStatus = deriveDisplayStatus(backend.status, returnStatus);

  return {
    id: backend.id,
    orderId: backend.orderId ?? backend.id.slice(0, 8),
    customerName: name,
    customerEmail: email,
    status: backend.status?.toLowerCase() ?? "unknown",
    totalAmount: formatGBP(backend.totalAmount),
    totalAmountRaw:
      typeof backend.totalAmount === "string"
        ? parseFloat(backend.totalAmount)
        : backend.totalAmount,
    itemCount: backend.itemCount ?? backend.orderItems?.length ?? 0,
    createdAt: backend.createdAt,
    reconciliationAttempts: backend.reconciliationAttempts ?? 0,
    retailerName: backend.vendor?.storeName ?? backend.vendorName,
    retailerId: backend.vendor?.id ?? backend.vendorId,
    outletName: backend.outlet?.name ?? backend.outletName ?? null,
    outletId: backend.outlet?.id ?? backend.outletId ?? null,
    userId: backend.user?.id ?? backend.customerId ?? undefined,
    paymentStatus: backend.paymentStatus?.toLowerCase(),
    returnStatus,
    displayStatus,
    refundState: backend.refundState ?? "NONE",
    totalRefundedFormatted: formatPositiveGBP(backend.totalRefundedAmount),
    shopifySays: toShopifySays(backend),
  };
}

/**
 * Shopify's financial_status → the refund state it implies, for the
 * disagreement check. Statuses that say nothing about refunds map to null.
 */
const SHOPIFY_FINANCIAL_TO_REFUND_STATE: Record<string, RefundState> = {
  refunded: "FULL",
  partially_refunded: "PARTIAL",
};

function toShopifySays(backend: BackendOrder): ShopifySays | null {
  if (!backend.shopifyStatusAt) return null;
  const financialStatus = backend.shopifyFinancialStatus ?? null;
  const fulfillmentStatus = backend.shopifyFulfillmentStatus ?? null;
  const implied = financialStatus
    ? SHOPIFY_FINANCIAL_TO_REFUND_STATE[financialStatus.toLowerCase()]
    : undefined;
  const ours = backend.refundState ?? "NONE";
  return {
    financialStatus,
    fulfillmentStatus,
    at: backend.shopifyStatusAt,
    label: `${financialStatus ?? "—"} · ${fulfillmentStatus ?? "unfulfilled"}`,
    // Only statuses that assert a refund can disagree; and NONE vs a refund
    // status is a disagreement too (Shopify saw money move, we did not).
    disagreesWithRefundState: implied !== undefined && implied !== ours,
  };
}

/** Number from a decimal that may arrive as a string; 0 when absent. */
function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return Number.isNaN(num) ? 0 : num;
}

/** Formatted GBP when > 0, else null — for "only show when it happened" rows. */
function formatPositiveGBP(
  value: string | number | null | undefined,
): string | null {
  const num = toNumber(value);
  return num > 0 ? formatGBP(num) : null;
}

// ---------------------------------------------------------------------------
// Transform: BackendOrder -> OrderDetailViewModel
// ---------------------------------------------------------------------------

/** Safely extract a string from a Record. */
function str(
  obj: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  if (!obj) return null;
  const val = obj[key];
  return typeof val === "string" ? val : null;
}

/** Transform a BackendOrderItem into an OrderItemViewModel. */
function toItemViewModel(
  item: BackendOrderItem,
  index: number,
  returnedQuantity: number,
  orderRefundState: RefundState,
): OrderItemViewModel {
  const meta = item.metadata as Record<string, unknown> | null | undefined;

  // Extract first image from images array: [{src, ...}, ...]
  const images = meta?.images as Array<{ src?: string }> | undefined;
  const imageUrl = images?.[0]?.src ?? null;

  // Packing status lives in packingState.status; 'cancelled' is a line the
  // retailer removed at acceptance (markOrderReady partial refund).
  const packingState = meta?.packingState as
    | Record<string, unknown>
    | undefined;
  const packingStatus = (packingState?.status as string) ?? null;
  const lineStatus: LineStatus =
    returnedQuantity > 0
      ? "RETURNED"
      : packingStatus === "cancelled" || orderRefundState === "FULL"
        ? "REFUNDED"
        : "PAID";

  return {
    id: item.id ?? `item-${index}`,
    productName:
      (meta?.productName as string) ?? `Product ${item.productId.slice(0, 8)}`,
    // metadata.title duplicates the product name; variantTitle is the real
    // variant (e.g. "Large"). optionValues is the fallback when the item was
    // never enriched — stored either as plain strings (oldest orders) or as
    // {value, option: {name}} objects (variant_option_values shape).
    variant:
      (meta?.variantTitle as string) ??
      formatOptionValues(meta?.optionValues) ??
      "--",
    variantId:
      (meta?.shopifyVariantId as string) ??
      (item.variantId != null ? String(item.variantId) : null),
    sku: (meta?.sku as string) ?? "--",
    quantity: item.quantity,
    unitPrice: formatGBP(item.price),
    totalPrice: formatGBP(item.totalPrice),
    imageUrl,
    packingStatus,
    returnedQuantity,
    lineStatus,
  };
}

/** Transform a BackendOrder into an OrderDetailViewModel for the detail page. */
export function toOrderDetailViewModel(
  backend: BackendOrder,
): OrderDetailViewModel {
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

  // TT-226 — returned quantity per order item across all returns + line items.
  // Excludes DECLINED/CANCELLED returns since they didn't result in items returned.
  const returnedQuantityByOrderItem = new Map<string, number>();
  for (const r of backend.returns ?? []) {
    const status = (r.status ?? "").toUpperCase();
    if (
      status === "DECLINED" ||
      status === "CANCELLED" ||
      status === "CANCELED"
    ) {
      continue;
    }
    for (const line of r.lineItems ?? []) {
      const orderItemId = line.orderItem?.id;
      if (!orderItemId) continue;
      returnedQuantityByOrderItem.set(
        orderItemId,
        (returnedQuantityByOrderItem.get(orderItemId) ?? 0) +
          (line.quantity ?? 0),
      );
    }
  }

  // Items
  const items = (backend.orderItems ?? []).map((item, idx) =>
    toItemViewModel(
      item,
      idx,
      item.id ? (returnedQuantityByOrderItem.get(item.id) ?? 0) : 0,
      base.refundState,
    ),
  );

  // Payment — capture status + rail. (The Stripe-era `payments` relation was
  // dropped in TT-473; refunds are their own rows below.)
  const payment = backend.paymentStatus
    ? {
        status: backend.paymentStatus.toLowerCase(),
        method: backend.paymentMethod ?? "Unknown",
      }
    : null;

  // Shipping address from JSONB
  const sa = backend.shippingAddress as
    | Record<string, unknown>
    | null
    | undefined;
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
  const pb = backend.pricingBreakdown as
    | Record<string, unknown>
    | null
    | undefined;
  const isShopifyOrder =
    !!backend.shopifyOrderId ||
    backend.paymentMethod === "shopify_checkout" ||
    pb?.shopifyCheckout === true;
  // TT-326 — customer discount lives in pricingBreakdown.discount (also
  // backfilled onto historical orders). Only surface it when non-zero.
  const discountRaw = typeof pb?.discount === "number" ? pb.discount : 0;
  const totalRefundedRaw = toNumber(backend.totalRefundedAmount);
  const chargedRaw = toNumber(backend.totalAmount);
  const pricing = pb
    ? (() => {
        const items = toNumber((pb.items as number) ?? backend.subtotal);
        const deliveryFee = toNumber(pb.deliveryFee as number | null);
        const serviceFee = toNumber(pb.serviceFee as number | null);
        const packagingFee = toNumber(pb.packagingFee as number | null);
        // The order as it stands now — Shopify's "Total" line (TT-471).
        const currentTotal =
          Math.max(0, items - discountRaw) +
          deliveryFee +
          serviceFee +
          packagingFee;
        return {
          subtotal: formatGBP(items),
          deliveryFee: formatGBP(deliveryFee),
          serviceFee: formatGBP(serviceFee),
          discount: discountRaw > 0 ? formatGBP(discountRaw) : null,
          total: formatGBP(currentTotal),
          paid: formatGBP(chargedRaw),
          netPaid:
            totalRefundedRaw > 0
              ? formatGBP(Math.max(0, chargedRaw - totalRefundedRaw))
              : null,
          isShopifyOrder,
        };
      })()
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

  // TT-473 — one timeline of refunds and returns. The "why" of a refund
  // splits by author: `note` is the retailer's text on a refund THEY issued;
  // a Return-linked refund has no note (Shopify never copies the return reason
  // onto the refund) and its reason is what the CUSTOMER selected on the
  // Return's line items. Never show the empty note on a Return-linked refund
  // as if something is missing. A refunded Return is shown once, on its
  // refund; a Return with no refund yet is its own entry.
  const itemNameById = new Map(items.map((i) => [i.id, i.productName]));
  const summarizeReturn = (r: ReturnViewModel): ReturnSummary => ({
    shopifyReturnId: r.shopifyReturnId,
    status: r.status,
    customerNote: r.customerNote,
    lineItems: r.lineItems.map((li) => ({
      id: li.id,
      quantity: li.quantity,
      productName:
        (li.orderItemId && itemNameById.get(li.orderItemId)) || "Unknown item",
      condition: li.condition,
    })),
  });
  const returnsById = new Map(returns.map((r) => [r.id, r]));
  const refundedReturnIds = new Set<string>();
  const refundEvents: RefundEvent[] = (backend.refunds ?? []).map((r) => {
    const linkedReturn = r.returnId ? returnsById.get(r.returnId) : undefined;
    if (r.returnId) refundedReturnIds.add(r.returnId);
    return {
      kind: "refund",
      id: r.id,
      date: r.refundedAt,
      amountFormatted: formatGBP(toNumber(r.refundedAmount)),
      shippingFormatted: formatPositiveGBP(r.shippingRefundAmount),
      reason: r.returnId
        ? { source: "customer", text: returnReasonText(linkedReturn) }
        : r.note
          ? { source: "retailer", text: r.note }
          : null,
      return: linkedReturn ? summarizeReturn(linkedReturn) : null,
    };
  });
  for (const r of returns) {
    if (refundedReturnIds.has(r.id)) continue;
    refundEvents.push({
      kind: "return",
      id: r.id,
      date: r.createdAt,
      return: summarizeReturn(r),
    });
  }
  refundEvents.sort((a, b) => a.date.localeCompare(b.date));

  return {
    ...base,
    shopifyOrderId: backend.shopifyOrderId ?? null,
    customer,
    retailer,
    items,
    payment,
    shippingAddress,
    pricing,
    returnStatus: backend.returnStatus ?? "NONE",
    totalShippingRefundedAmount: totalShippingRefunded,
    totalShippingRefundedFormatted,
    returns,
    refundEvents,
  };
}

/** "SOMETHING_LIKE_THIS" → "Something like this". */
export function humanize(value: string): string {
  if (!value) return "";
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The customer's reasons on a Return, de-duplicated and humanized, or null
 * when the Return carries none we can show (all UNKNOWN, or not loaded).
 */
function returnReasonText(ret: ReturnViewModel | undefined): string | null {
  if (!ret) return null;
  const reasons = Array.from(
    new Set(
      ret.lineItems
        .map((li) => li.reason)
        .filter((reason) => reason && reason.toUpperCase() !== "UNKNOWN")
        .map(humanize),
    ),
  );
  return reasons.length > 0 ? reasons.join(", ") : null;
}
