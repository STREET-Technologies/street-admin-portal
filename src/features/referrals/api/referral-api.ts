import { api, toQueryString } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type {
  BackendReferralCode,
  BackendReferralUse,
  BackendReferralSettings,
  ReferralCodeListParams,
} from "../types";

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch paginated list of referral codes. */
export function getReferralCodes(
  params: ReferralCodeListParams = {},
): Promise<PaginatedResponse<BackendReferralCode>> {
  return api.getPaginated<BackendReferralCode>(
    `admin/referral-codes${toQueryString(params)}`,
  );
}

/** Fetch a single referral code by ID. */
export async function getReferralCode(
  id: string,
): Promise<BackendReferralCode> {
  return api.get<BackendReferralCode>(`admin/referral-codes/${id}`);
}

/** Toggle a referral code's active status. */
export async function updateReferralCode(
  id: string,
  data: { isActive: boolean },
): Promise<BackendReferralCode> {
  return api.patch<BackendReferralCode>(`admin/referral-codes/${id}`, data);
}

/** Fetch uses for a referral code. */
export async function getReferralUses(
  codeId: string,
): Promise<BackendReferralUse[]> {
  return api.get<BackendReferralUse[]>(`admin/referral-codes/${codeId}/uses`);
}

/** Create a promotional referral code. */
export interface CreatePromotionalCodePayload {
  code: string;
  belongsTo?: string;
  expiresAt?: string;
  maxUses?: number;
}

export async function createPromotionalCode(
  data: CreatePromotionalCodePayload,
): Promise<BackendReferralCode> {
  return api.post<BackendReferralCode>(
    "admin/referral-codes/promotional",
    data,
  );
}

/** Fetch referral program settings. */
export async function getReferralSettings(): Promise<BackendReferralSettings> {
  return api.get<BackendReferralSettings>("admin/referral-settings");
}

/** Update referral program settings. */
export interface UpdateReferralSettingsPayload {
  defaultFriendRewardValue?: number;
  defaultReferrerRewardValue?: number;
  defaultMinimumOrderAmount?: number;
  isActive?: boolean;
  maxUsesPerCode?: number;
  codeExpiryDays?: number;
}

export async function updateReferralSettings(
  data: UpdateReferralSettingsPayload,
): Promise<BackendReferralSettings> {
  return api.patch<BackendReferralSettings>("admin/referral-settings", data);
}
