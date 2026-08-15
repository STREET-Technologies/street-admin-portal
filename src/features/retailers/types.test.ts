import { describe, it, expect } from "vitest";
import { formatRevalidateResult, toRetailerViewModel } from "./types";
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

/**
 * TT-473 — the re-validate button toasts the endpoint's counts so support can
 * tell "nothing was stale" from "the call did nothing".
 */
describe("formatRevalidateResult", () => {
  it("pluralises both counts", () => {
    expect(formatRevalidateResult({ revalidated: 3, changed: 1 })).toBe(
      "Re-validated 3 outlets, 1 verdict changed",
    );
    expect(formatRevalidateResult({ revalidated: 1, changed: 2 })).toBe(
      "Re-validated 1 outlet, 2 verdicts changed",
    );
  });

  it("says so when every verdict already stood", () => {
    expect(formatRevalidateResult({ revalidated: 2, changed: 0 })).toBe(
      "Re-validated 2 outlets, no verdicts changed",
    );
  });
});
