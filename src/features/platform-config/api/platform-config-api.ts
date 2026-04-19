import { api } from "@/lib/api-client";

export interface PlatformConfig {
  deliveryFeeGbp: number;
  serviceFeeGbp: number;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  return api.get<PlatformConfig>("admin/config");
}

export async function updatePlatformConfig(data: Partial<PlatformConfig>): Promise<PlatformConfig> {
  return api.patch<PlatformConfig>("admin/config", data);
}
