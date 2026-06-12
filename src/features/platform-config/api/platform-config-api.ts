import { api } from "@/lib/api-client";

export interface PlatformConfig {
  deliveryFeeGbp: number;
  serviceFeeGbp: number;
  /** Seconds a retailer has to accept an order before it auto-misses. 0 = disabled. */
  acceptanceTimeoutSeconds: number;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  return api.get<PlatformConfig>("admin/config");
}

export async function updatePlatformConfig(data: Partial<PlatformConfig>): Promise<PlatformConfig> {
  return api.patch<PlatformConfig>("admin/config", data);
}
