import type { BackendUserDevice } from "./types";

/**
 * Push registrations → devices (TT-452).
 *
 * The backend stores one row per REGISTRATION, not per device. A token
 * rotates, the app is reinstalled, the customer signs out and back in — each
 * one writes a new row and deactivates the last. Listing rows raw would tell
 * support a customer with one phone owns twenty devices, so we group by
 * deviceId and count the registrations underneath.
 *
 * Known limits, both upstream of here:
 *  - Android sends the ROM build host as deviceId (TT-454), which is shared
 *    across every handset on that build. Two identical Android phones owned
 *    by the same customer therefore collapse into one group. Rare enough to
 *    accept; the registration list underneath still shows both.
 *  - Only one registration per user per platform can be active at a time
 *    (TT-453), so a customer with an iPhone and an iPad shows one live
 *    device and one that looks dormant but isn't.
 */

export interface DeviceGroup {
  /** Stable key for React — the deviceId, or the row id when it is missing. */
  key: string;
  /** Best available label for the hardware. */
  name: string;
  platform: BackendUserDevice["platform"];
  deviceId: string | null;
  /** True when any registration for this device is still live. */
  isActive: boolean;
  /**
   * Newest lastUsedAt across the group, falling back to createdAt.
   *
   * Sorts the list; deliberately NOT displayed on the device row — the
   * registration table's own Last used column says it per registration,
   * which is the more precise answer to the same question.
   */
  lastSeenAt: string | null;
  /** First time this device ever registered. */
  firstSeenAt: string;
  /** Newest first. Always at least one. */
  registrations: BackendUserDevice[];
}

/** Reads an app version out of the metadata blob, whatever shape it is in. */
export function readAppVersion(
  metadata: Record<string, unknown> | null,
): string | null {
  const version = metadata?.appVersion;
  if (typeof version !== "string" || version.trim() === "") return null;
  const build = metadata?.appBuild;
  return typeof build === "string" && build.trim() !== ""
    ? `${version} (${build})`
    : version;
}

/** Reads the OS version out of the metadata blob. Bare number, no platform. */
export function readOsVersion(
  metadata: Record<string, unknown> | null,
): string | null {
  const version = metadata?.osVersion;
  if (typeof version !== "string" || version.trim() === "") return null;
  return version.trim();
}

/**
 * Platform as support says it, carrying the OS version when we have one:
 * "Android 15", "iOS 18.2", or just "Android" on older registrations.
 *
 * The two are joined rather than shown as separate fields because "android"
 * followed by a bare "15" reads as a version of nothing in particular.
 */
export function platformDisplay(
  platform: BackendUserDevice["platform"],
  osVersion: string | null,
): string {
  const name =
    platform === "ios" ? "iOS" : platform === "android" ? "Android" : "Web";
  return osVersion ? `${name} ${osVersion}` : name;
}

/** Newest of two ISO timestamps; nulls lose. */
function latest(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

/**
 * Groups registrations by device, newest device first.
 *
 * Does not assume the backend's sort order — the caller renders whatever
 * comes back from cache, which may be a stale page.
 */
export function groupDevices(rows: BackendUserDevice[]): DeviceGroup[] {
  const groups = new Map<string, DeviceGroup>();

  for (const row of rows) {
    // A null deviceId can't be matched to anything, so each such row stands
    // alone rather than merging every unidentified registration into one
    // phantom device.
    const key = row.deviceId ?? `row:${row.id}`;
    const seenAt = row.lastUsedAt ?? row.createdAt;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        name: row.deviceName ?? platformLabel(row.platform),
        platform: row.platform,
        deviceId: row.deviceId,
        isActive: row.isActive,
        lastSeenAt: seenAt,
        firstSeenAt: row.createdAt,
        registrations: [row],
      });
      continue;
    }

    existing.registrations.push(row);
    existing.isActive = existing.isActive || row.isActive;
    existing.lastSeenAt = latest(existing.lastSeenAt, seenAt);
    if (Date.parse(row.createdAt) < Date.parse(existing.firstSeenAt)) {
      existing.firstSeenAt = row.createdAt;
    }
  }

  for (const group of groups.values()) {
    group.registrations.sort(
      (a, b) =>
        Date.parse(b.lastUsedAt ?? b.createdAt) -
        Date.parse(a.lastUsedAt ?? a.createdAt),
    );
    // The newest registration owns the display name and version: a renamed
    // phone or an upgraded app should read as it is today, not as it was.
    const newest = group.registrations[0];
    group.name = newest.deviceName ?? platformLabel(newest.platform);
  }

  return [...groups.values()].sort((a, b) => {
    // Live devices lead — that is the one support is about to ask about.
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return Date.parse(b.lastSeenAt ?? "0") - Date.parse(a.lastSeenAt ?? "0");
  });
}

export function platformLabel(platform: BackendUserDevice["platform"]): string {
  if (platform === "ios") return "iOS device";
  if (platform === "android") return "Android device";
  return "Web browser";
}
