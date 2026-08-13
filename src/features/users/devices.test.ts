import { describe, it, expect } from "vitest";
import {
  groupDevices,
  readAppVersion,
  readOsVersion,
  platformDisplay,
  platformLabel,
} from "./devices";
import type { BackendUserDevice } from "./types";

// The bug this file exists to prevent: staging's heaviest customer has 23
// registration rows from ONE phone. Rendering rows raw claimed 23 devices.
function row(overrides: Partial<BackendUserDevice> = {}): BackendUserDevice {
  return {
    id: "row-1",
    token: "fcm-abc",
    platform: "ios",
    deviceName: "iPhone 17 (iPhone)",
    deviceId: "device-a",
    recipientType: "user",
    isActive: false,
    lastUsedAt: "2026-08-01T10:00:00.000Z",
    metadata: null,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("groupDevices", () => {
  it("collapses repeat registrations of one device into one entry", () => {
    const groups = groupDevices([
      row({ id: "a", lastUsedAt: "2026-08-03T00:00:00.000Z" }),
      row({ id: "b", lastUsedAt: "2026-08-02T00:00:00.000Z" }),
      row({ id: "c", lastUsedAt: "2026-08-01T00:00:00.000Z" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].registrations).toHaveLength(3);
  });

  it("keeps genuinely separate devices apart", () => {
    const groups = groupDevices([
      row({ id: "a", deviceId: "device-a" }),
      row({ id: "b", deviceId: "device-b", platform: "android" }),
    ]);

    expect(groups).toHaveLength(2);
  });

  it("gives every unidentified registration its own row", () => {
    // Merging null deviceIds would invent a device that never existed.
    const groups = groupDevices([
      row({ id: "a", deviceId: null }),
      row({ id: "b", deviceId: null }),
    ]);

    expect(groups).toHaveLength(2);
  });

  it("treats a device as active when any of its registrations is live", () => {
    const groups = groupDevices([
      row({ id: "a", isActive: false, lastUsedAt: "2026-08-03T00:00:00.000Z" }),
      row({ id: "b", isActive: true, lastUsedAt: "2026-08-01T00:00:00.000Z" }),
    ]);

    expect(groups[0].isActive).toBe(true);
  });

  it("puts live devices first, then most recently seen", () => {
    const groups = groupDevices([
      row({
        id: "old",
        deviceId: "old",
        isActive: false,
        lastUsedAt: "2026-08-10T00:00:00.000Z",
      }),
      row({
        id: "live",
        deviceId: "live",
        isActive: true,
        lastUsedAt: "2026-01-01T00:00:00.000Z",
      }),
      row({
        id: "older",
        deviceId: "older",
        isActive: false,
        lastUsedAt: "2026-07-01T00:00:00.000Z",
      }),
    ]);

    expect(groups.map((g) => g.key)).toEqual(["live", "old", "older"]);
  });

  it("does not depend on the order rows arrive in", () => {
    const rows = [
      row({ id: "a", lastUsedAt: "2026-08-01T00:00:00.000Z" }),
      row({ id: "b", lastUsedAt: "2026-08-09T00:00:00.000Z" }),
    ];

    expect(groupDevices(rows)[0].lastSeenAt).toBe(
      groupDevices([...rows].reverse())[0].lastSeenAt,
    );
  });

  it("reports the newest activity and the oldest registration", () => {
    const groups = groupDevices([
      row({
        id: "a",
        createdAt: "2026-08-05T00:00:00.000Z",
        lastUsedAt: "2026-08-09T00:00:00.000Z",
      }),
      row({
        id: "b",
        createdAt: "2026-06-01T00:00:00.000Z",
        lastUsedAt: "2026-06-02T00:00:00.000Z",
      }),
    ]);

    expect(groups[0].lastSeenAt).toBe("2026-08-09T00:00:00.000Z");
    expect(groups[0].firstSeenAt).toBe("2026-06-01T00:00:00.000Z");
  });

  it("falls back to createdAt when a row was never used", () => {
    const groups = groupDevices([
      row({ lastUsedAt: null, createdAt: "2026-08-04T00:00:00.000Z" }),
    ]);

    expect(groups[0].lastSeenAt).toBe("2026-08-04T00:00:00.000Z");
  });

  it("names the device from its newest registration", () => {
    // A renamed phone should read as it is today.
    const groups = groupDevices([
      row({
        id: "old",
        deviceName: "Old name",
        lastUsedAt: "2026-08-01T00:00:00.000Z",
      }),
      row({
        id: "new",
        deviceName: "New name",
        lastUsedAt: "2026-08-09T00:00:00.000Z",
      }),
    ]);

    expect(groups[0].name).toBe("New name");
  });

  it("labels a device with no name by its platform", () => {
    expect(groupDevices([row({ deviceName: null })])[0].name).toBe("iOS device");
  });

  it("keeps versions on the registrations, not on the group", () => {
    // The device row shows identity only; OS and app version are columns of
    // the registration table, where each row states its own. Hoisting a
    // "current" version onto the group would restate the Active row.
    const groups = groupDevices([
      row({ metadata: { appVersion: "1.4.0", osVersion: "15" } }),
    ]);

    expect(groups[0]).not.toHaveProperty("appVersion");
    expect(groups[0]).not.toHaveProperty("osVersion");
    expect(groups[0].registrations[0].metadata).toEqual({
      appVersion: "1.4.0",
      osVersion: "15",
    });
  });

  it("survives a user with no registrations", () => {
    expect(groupDevices([])).toEqual([]);
  });
});

describe("readOsVersion", () => {
  it("returns the bare version", () => {
    expect(readOsVersion({ osVersion: "15" })).toBe("15");
  });

  it("trims and rejects blank or non-string values", () => {
    expect(readOsVersion({ osVersion: " 18.2 " })).toBe("18.2");
    expect(readOsVersion({ osVersion: "  " })).toBe(null);
    expect(readOsVersion({ osVersion: 15 })).toBe(null);
    expect(readOsVersion(null)).toBe(null);
  });

  it("ignores the retail PWA's metadata shape", () => {
    expect(readOsVersion({ timestamp: "2026-06-02", userAgent: "web" })).toBe(
      null,
    );
  });
});

describe("platformDisplay", () => {
  it("joins the platform and OS version", () => {
    // A bare "15" next to "android" reads as a version of nothing.
    expect(platformDisplay("android", "15")).toBe("Android 15");
    expect(platformDisplay("ios", "18.2")).toBe("iOS 18.2");
  });

  it("falls back to the platform alone when the OS is unknown", () => {
    expect(platformDisplay("android", null)).toBe("Android");
    expect(platformDisplay("ios", null)).toBe("iOS");
    expect(platformDisplay("web", null)).toBe("Web");
  });

  it("capitalises iOS properly rather than relying on CSS", () => {
    // The old markup used `capitalize` on the raw enum, which renders "Ios".
    expect(platformDisplay("ios", null)).not.toBe("Ios");
  });
});

describe("readAppVersion", () => {
  it("appends the build number when present", () => {
    expect(readAppVersion({ appVersion: "1.4.0", appBuild: "212" })).toBe(
      "1.4.0 (212)",
    );
  });

  it("returns the version alone when there is no build", () => {
    expect(readAppVersion({ appVersion: "1.4.0" })).toBe("1.4.0");
  });

  it("ignores the retail PWA's metadata shape", () => {
    // Vendor rows carry {timestamp, userAgent:"web"} and no version.
    expect(readAppVersion({ timestamp: "2026-06-02", userAgent: "web" })).toBe(
      null,
    );
  });

  it("treats blank and non-string versions as absent", () => {
    expect(readAppVersion({ appVersion: "  " })).toBe(null);
    expect(readAppVersion({ appVersion: 140 })).toBe(null);
    expect(readAppVersion(null)).toBe(null);
  });
});

describe("platformLabel", () => {
  it("names each platform in support's language", () => {
    expect(platformLabel("ios")).toBe("iOS device");
    expect(platformLabel("android")).toBe("Android device");
    expect(platformLabel("web")).toBe("Web browser");
  });
});
