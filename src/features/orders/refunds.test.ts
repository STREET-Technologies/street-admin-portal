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

describe("toOrderDetailViewModel refunds (TT-473)", () => {
  it("shows the retailer's note on a standalone refund", () => {
    const [standalone] = toOrderDetailViewModel(base).refunds;
    expect(standalone).toMatchObject({
      id: "r1",
      refundedAmountFormatted: "£38.00",
      shippingRefundAmountFormatted: null,
      shopifyReturnId: null,
      reason: {
        source: "retailer",
        text: "Item(s) unavailable: Out of stock",
      },
    });
  });

  it("shows the customer's return reason on a Return-linked refund, never the empty note", () => {
    const [, linked] = toOrderDetailViewModel(base).refunds;
    expect(linked).toMatchObject({
      id: "r2",
      refundedAmountFormatted: "£60.00",
      shippingRefundAmountFormatted: "£9.99",
      shopifyReturnId: "20336279622",
      reason: { source: "customer", text: "Color" },
    });
  });

  it("only reports no reason when a standalone refund genuinely has none", () => {
    const vm = toOrderDetailViewModel({
      ...base,
      refunds: [{ ...base.refunds![0], note: null }],
    });
    expect(vm.refunds[0].reason).toBeNull();
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
    expect(vm.refunds[0].reason).toEqual({ source: "customer", text: null });
  });

  it("de-duplicates repeated line reasons on one Return", () => {
    const li = base.returns![0].lineItems![0];
    const vm = toOrderDetailViewModel({
      ...base,
      returns: [
        {
          ...base.returns![0],
          lineItems: [li, { ...li, id: "li-2" }, { ...li, id: "li-3", reason: "SIZE_TOO_SMALL" }],
        },
      ],
      refunds: [base.refunds![1]],
    });
    expect(vm.refunds[0].reason?.text).toBe("Color, Size too small");
  });

  it("carries the refund total onto the detail so the pricing section needs no payments row", () => {
    const vm = toOrderDetailViewModel({ ...base, paymentStatus: "PAID" });
    expect(vm.totalRefundedFormatted).toBe("£98.00");
    expect(vm.payment).toEqual({ status: "paid", method: "Unknown" });
  });
});
