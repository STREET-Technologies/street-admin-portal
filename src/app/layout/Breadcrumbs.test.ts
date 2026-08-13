import { describe, it, expect } from "vitest";
import { LABEL_RESOLVERS } from "./breadcrumb-labels";
import { userKeys } from "@/features/users/api/user-queries";
import { retailerKeys } from "@/features/retailers/api/retailer-queries";
import { orderKeys } from "@/features/orders/api/order-queries";

/**
 * The breadcrumb reads whatever the detail pages put in the query cache, so it
 * must use byte-identical query keys. Nothing fails loudly if they drift — the
 * crumb just silently falls back to showing the raw UUID again, which is the
 * exact bug these keys were written to fix. Pin them to the key factories.
 */
describe("Breadcrumbs label resolvers", () => {
  it("uses the same cache key as the user detail query", () => {
    expect(LABEL_RESOLVERS.users.queryKey("user-1")).toEqual([
      ...userKeys.detail("user-1"),
    ]);
  });

  it("uses the same cache key as the retailer detail query", () => {
    expect(LABEL_RESOLVERS.retailers.queryKey("vendor-1")).toEqual([
      ...retailerKeys.detail("vendor-1"),
    ]);
  });

  it("uses the same cache key as the order detail query", () => {
    expect(LABEL_RESOLVERS.orders.queryKey("ST-001280")).toEqual([
      ...orderKeys.detailByOrderId("ST-001280"),
    ]);
  });

  it("builds a retailer label from the raw cached vendor", () => {
    const label = LABEL_RESOLVERS.retailers.toLabel({
      id: "vendor-1",
      storeName: "Gymshark",
    } as never);

    expect(label).toBe("Gymshark");
  });

  it("builds a user label from the raw cached user", () => {
    const label = LABEL_RESOLVERS.users.toLabel({
      id: "user-1",
      firstName: "Ada",
      lastName: "Lovelace",
    } as never);

    expect(label).toBe("Ada Lovelace");
  });

  it("returns null rather than an empty label when the name is missing", () => {
    // Falling back to null lets the caller show the raw segment instead of
    // rendering a blank crumb.
    expect(LABEL_RESOLVERS.retailers.toLabel({ id: "v" } as never)).toBeNull();
    expect(LABEL_RESOLVERS.orders.toLabel({ id: "o" } as never)).toBeNull();
  });
});
