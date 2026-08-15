/**
 * TT-473 — refunds on the admin order shapes.
 *
 * The backend derives `refundState` and ships the per-refund rows; the portal
 * only formats. The one piece of logic that lives here is resolving the "why"
 * of a refund: a standalone refund carries the retailer's `note`; a
 * Return-linked refund carries the customer's line-item reasons from the
 * loaded Return. Different authors, never both on one refund — and an empty
 * note on a Return-linked refund is NOT a missing reason.
 */
import { describe, expect, it } from "vitest";
import { toOrderDetailViewModel, toOrderViewModel } from "./types";
import type { BackendOrder } from "./types";

const base: BackendOrder = {
  id: "uuid-1295",
  orderId: "ST-001295",
  customerId: null,
  customerName: "Test Customer",
  status: "DELIVERED",
  totalAmount: "70.98",
  createdAt: "2026-08-15T08:00:00Z",
  orderItems: [],
  totalRefundedAmount: "98.00",
  refundState: "FULL",
  returns: [
    {
      id: "ret-uuid",
      shopifyReturnId: "20336279622",
      status: "CLOSED",
      createdAt: "2026-08-15T09:30:00Z",
      lineItems: [
        {
          id: "li-1",
          quantity: 1,
          reason: "COLOR",
          condition: "UNKNOWN",
          orderItem: { id: "item-1" },
        },
      ],
    },
  ],
  refunds: [
    {
      id: "r1",
      returnId: null,
      refundedAmount: "38.00",
      shippingRefundAmount: "0.00",
      note: "Item(s) unavailable: Out of stock",
      refundedAt: "2026-08-15T09:00:00Z",
    },
    {
      id: "r2",
      returnId: "ret-uuid",
      refundedAmount: "60.00",
      shippingRefundAmount: "9.99",
      note: null,
      refundedAt: "2026-08-15T10:00:00Z",
    },
  ],
};

describe("toOrderViewModel refund fields (TT-473)", () => {
  it("passes the backend-derived refundState through and formats the total", () => {
    const vm = toOrderViewModel(base);
    expect(vm.refundState).toBe("FULL");
    expect(vm.totalRefundedFormatted).toBe("£98.00");
  });

  it("reads NONE and no formatted total on an order that was never refunded", () => {
    const vm = toOrderViewModel({
      ...base,
      totalRefundedAmount: "0.00",
      refundState: "NONE",
    });
    expect(vm.refundState).toBe("NONE");
    expect(vm.totalRefundedFormatted).toBeNull();
  });

  it("defaults to NONE when an older backend omits refundState", () => {
    const { refundState: _omit, ...withoutState } = base;
    expect(toOrderViewModel(withoutState).refundState).toBe("NONE");
  });
});

describe("toOrderDetailViewModel refund events (TT-473)", () => {
  it("shows the retailer's note on a standalone refund", () => {
    const [standalone] = toOrderDetailViewModel(base).refundEvents;
    expect(standalone).toMatchObject({
      kind: "refund",
      id: "r1",
      amountFormatted: "£38.00",
      shippingFormatted: null,
      reason: { source: "retailer", text: "Item(s) unavailable: Out of stock" },
      return: null,
    });
  });

  it("shows the customer's return reason and the return detail on a Return-linked refund, never the empty note", () => {
    const [, linked] = toOrderDetailViewModel(base).refundEvents;
    expect(linked).toMatchObject({
      kind: "refund",
      id: "r2",
      amountFormatted: "£60.00",
      shippingFormatted: "£9.99",
      reason: { source: "customer", text: "Color" },
      return: {
        shopifyReturnId: "20336279622",
        status: "CLOSED",
        lineItems: [{ quantity: 1, condition: "UNKNOWN" }],
      },
    });
  });

  it("does not list a refunded Return a second time as its own event", () => {
    const events = toOrderDetailViewModel(base).refundEvents;
    expect(events.map((e) => e.kind)).toEqual(["refund", "refund"]);
  });

  it("lists an open, not-yet-refunded Return as its own event", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refunds: [],
      totalRefundedAmount: "0.00",
      refundState: "NONE",
      returns: [{ ...base.returns![0], status: "REQUESTED", closedAt: null }],
    });
    expect(vm.refundEvents).toEqual([
      expect.objectContaining({
        kind: "return",
        date: "2026-08-15T09:30:00Z",
        return: expect.objectContaining({
          shopifyReturnId: "20336279622",
          status: "REQUESTED",
        }),
      }),
    ]);
  });

  it("orders events by date, oldest first", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refunds: [base.refunds![1], base.refunds![0]],
    });
    expect(vm.refundEvents.map((e) => e.id)).toEqual(["r1", "r2"]);
  });

  it("only reports no reason when a standalone refund genuinely has none", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refunds: [{ ...base.refunds![0], note: null }],
    });
    expect(vm.refundEvents[0]).toMatchObject({ kind: "refund", reason: null });
  });

  it("keeps a Return-linked refund attributed to the customer even when the Return has no usable reasons", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      returns: [
        {
          ...base.returns![0],
          lineItems: [{ ...base.returns![0].lineItems![0], reason: "UNKNOWN" }],
        },
      ],
      refunds: [base.refunds![1]],
    });
    expect(vm.refundEvents[0]).toMatchObject({
      reason: { source: "customer", text: null },
    });
  });

  it("de-duplicates repeated line reasons on one Return", () => {
    const li = base.returns![0].lineItems![0];
    const vm = toOrderDetailViewModel({
      ...base,
      returns: [
        {
          ...base.returns![0],
          lineItems: [
            li,
            { ...li, id: "li-2" },
            { ...li, id: "li-3", reason: "SIZE_TOO_SMALL" },
          ],
        },
      ],
      refunds: [base.refunds![1]],
    });
    expect(vm.refundEvents[0]).toMatchObject({
      reason: { text: "Color, Size too small" },
    });
  });

  it("carries the refund total onto the detail so the pricing section needs no payments row", () => {
    const vm = toOrderDetailViewModel({ ...base, paymentStatus: "PAID" });
    expect(vm.totalRefundedFormatted).toBe("£98.00");
    expect(vm.payment).toEqual({ status: "paid", method: "Unknown" });
  });
});

describe("line item status (TT-473)", () => {
  const items = [
    {
      id: "item-1",
      productId: "p1",
      variantId: "v1",
      quantity: 1,
      price: "60.00",
      totalPrice: "60.00",
      metadata: { productName: "Hoodie" },
    },
    {
      id: "item-2",
      productId: "p2",
      variantId: "v2",
      quantity: 2,
      price: "19.00",
      totalPrice: "38.00",
      metadata: {
        productName: "Cap",
        packingState: {
          status: "cancelled",
          cancellationReason: "Out of stock",
        },
      },
    },
    {
      id: "item-3",
      productId: "p3",
      variantId: "v3",
      quantity: 1,
      price: "10.00",
      totalPrice: "10.00",
      metadata: { productName: "Socks" },
    },
  ];

  it("marks a line removed at acceptance as REFUNDED and a returned line as RETURNED", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refundState: "PARTIAL",
      orderItems: items,
    });
    expect(vm.items.map((i) => [i.productName, i.lineStatus])).toEqual([
      ["Hoodie", "RETURNED"],
      ["Cap", "REFUNDED"],
      ["Socks", "PAID"],
    ]);
  });

  it("marks every remaining PAID line REFUNDED when the whole order is refunded", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refundState: "FULL",
      orderItems: items,
    });
    expect(vm.items.map((i) => i.lineStatus)).toEqual([
      "RETURNED",
      "REFUNDED",
      "REFUNDED",
    ]);
  });

  it("keeps the returned quantity so a partial return can read RETURNED 1/2", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refundState: "PARTIAL",
      orderItems: [{ ...items[0], quantity: 2, totalPrice: "120.00" }],
    });
    expect(vm.items[0]).toMatchObject({
      lineStatus: "RETURNED",
      returnedQuantity: 1,
      quantity: 2,
    });
  });
});

/**
 * TT-471 — Pricing mirrors Shopify's own summary. totalAmount is what was
 * charged and never shrinks; the Total row is the order as it stands now
 * (goods remaining + fees − discount); when money came back the section shows
 * Paid / Refunded / Net paid.
 */
describe("pricing summary after a packing removal (TT-471)", () => {
  const removed: BackendOrder = {
    ...base,
    totalAmount: "97.99",
    subtotal: "46.00",
    totalRefundedAmount: "42.00",
    refundState: "PARTIAL",
    pricingBreakdown: {
      items: 46,
      deliveryFee: 9.99,
      serviceFee: 0,
      packagingFee: 0,
      discount: 0,
      total: 97.99,
      refundedAmount: 42,
      shopifyCheckout: true,
    },
  };

  it("shows the order as it stands as Total, and what was charged as Paid", () => {
    const vm = toOrderDetailViewModel(removed);
    expect(vm.pricing).toMatchObject({
      subtotal: "£46.00",
      deliveryFee: "£9.99",
      total: "£55.99",
      paid: "£97.99",
      netPaid: "£55.99",
    });
  });

  it("nets a discount off the current total", () => {
    const vm = toOrderDetailViewModel({
      ...removed,
      pricingBreakdown: { ...removed.pricingBreakdown, discount: 5 },
    });
    expect(vm.pricing?.total).toBe("£50.99");
  });

  it("has no net when nothing was refunded", () => {
    const vm = toOrderDetailViewModel({
      ...removed,
      totalAmount: "55.99",
      totalRefundedAmount: "0",
      refundState: "NONE",
    });
    expect(vm.pricing).toMatchObject({
      total: "£55.99",
      paid: "£55.99",
      netPaid: null,
    });
  });
});
