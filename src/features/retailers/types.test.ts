import { describe, it, expect } from "vitest";
import { toRetailerViewModel } from "./types";
import type { BackendVendor } from "./types";

function makeBackendVendor(
  overrides: Partial<BackendVendor> = {},
): BackendVendor {
  return {
    id: "v1",
    storeName: "Test Store",
    email: "shop@example.com",
    phone: null,
    isActive: true,
    isOnline: true,
    uninstalledAt: null,
    vendorCategory: "Fashion",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  } as BackendVendor;
}

/**
 * Status derivation must stay in sync with the backend's admin list
 * status filter (VendorRepository.listVendors in street-backend).
 */
describe("toRetailerViewModel status derivation", () => {
  it("active when isActive and isOnline", () => {
    expect(toRetailerViewModel(makeBackendVendor()).status).toBe("active");
  });

  it("inactive when isActive but offline", () => {
    expect(
      toRetailerViewModel(makeBackendVendor({ isOnline: false })).status,
    ).toBe("inactive");
  });

  it("blocked when not isActive", () => {
    expect(
      toRetailerViewModel(makeBackendVendor({ isActive: false })).status,
    ).toBe("blocked");
  });

  it("uninstalled wins over all other flags", () => {
    const vendor = makeBackendVendor({
      isActive: false,
      isOnline: false,
      uninstalledAt: "2026-06-01T00:00:00Z",
    });
    expect(toRetailerViewModel(vendor).status).toBe("uninstalled");
  });
});
