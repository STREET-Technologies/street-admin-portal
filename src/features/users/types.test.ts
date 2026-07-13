import { describe, it, expect } from "vitest";
import { toUserViewModel } from "./types";
import type { BackendUser } from "./types";

function makeBackendUser(overrides: Partial<BackendUser> = {}): BackendUser {
  return {
    id: "u1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+447700900000",
    profileImage: null,
    role: "user",
    ssoProvider: null,
    language: "en",
    isTestAccount: false,
    isAnonymized: false,
    lockedUntil: null,
    failedLoginAttempts: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  } as BackendUser;
}

/**
 * Status derivation must stay in sync with the backend's admin list
 * status filter (UsersRepository.buildAdminUserQuery in street-backend).
 */
describe("toUserViewModel status derivation", () => {
  it("defaults to active", () => {
    expect(toUserViewModel(makeBackendUser()).status).toBe("active");
  });

  it("anonymized wins over everything", () => {
    const user = makeBackendUser({
      isAnonymized: true,
      lockedUntil: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(toUserViewModel(user).status).toBe("blocked");
  });

  it("future lockedUntil is suspended", () => {
    const user = makeBackendUser({
      lockedUntil: new Date(Date.now() + 60_000).toISOString(),
    });
    expect(toUserViewModel(user).status).toBe("suspended");
  });

  it("expired lockedUntil is active again", () => {
    const user = makeBackendUser({
      lockedUntil: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(toUserViewModel(user).status).toBe("active");
  });

  it("builds display name and falls back on missing contact fields", () => {
    const vm = toUserViewModel(
      makeBackendUser({ firstName: null, lastName: null, email: null, phone: null }),
    );
    expect(vm.name).toBe("Unknown");
    expect(vm.email).toBe("No email");
    expect(vm.phone).toBe("No phone");
  });
});
