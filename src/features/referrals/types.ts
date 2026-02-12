// ---------------------------------------------------------------------------
// Backend shapes (what the API returns)
// ---------------------------------------------------------------------------

/** Referral code as returned by GET /admin/referral-codes (raw query). */
export interface BackendReferralCode {
  id: string;
  code: string;
  isActive: boolean;
  codeType: "user_generated" | "promotional";
  belongsTo: string | null;
  totalUses: number;
  successfulReferrals: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdAt: string;
  ownerId: string | null;
  ownerName: string | null;
}

/** Referral use as returned by GET /admin/referral-codes/:id/uses. */
export interface BackendReferralUse {
  id: string;
  status: "pending" | "completed" | "cancelled" | "refunded";
  friendUserId: string | null;
  friendName: string | null;
  referrerUserId: string;
  referrerName: string | null;
  friendDiscountApplied: number;
  referrerRewardEarned: number;
  usedAt: string;
  completedAt: string | null;
}

/** Referral settings row from GET /admin/referral-settings. */
export interface BackendReferralSettings {
  id: string;
  defaultFriendRewardValue: number;
  defaultReferrerRewardValue: number;
  defaultMinimumOrderAmount: number;
  isActive: boolean;
  maxUsesPerCode: number | null;
  codeExpiryDays: number | null;
}

// ---------------------------------------------------------------------------
// Frontend view model
// ---------------------------------------------------------------------------

/** Transformed referral code for display. */
export interface ReferralCodeViewModel {
  id: string;
  code: string;
  isActive: boolean;
  type: "User" | "Promotional";
  belongsTo: string | null;
  totalUses: number;
  successfulReferrals: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdAt: string;
  ownerId: string | null;
  ownerName: string;
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

export function toReferralCodeViewModel(
  backend: BackendReferralCode,
): ReferralCodeViewModel {
  return {
    id: backend.id,
    code: backend.code,
    isActive: backend.isActive,
    type: backend.codeType === "promotional" ? "Promotional" : "User",
    belongsTo: backend.belongsTo,
    totalUses: backend.totalUses,
    successfulReferrals: backend.successfulReferrals,
    maxUses: backend.maxUses,
    expiresAt: backend.expiresAt,
    createdAt: backend.createdAt,
    ownerId: backend.ownerId,
    ownerName: backend.ownerName?.trim() || "No owner",
  };
}

// ---------------------------------------------------------------------------
// List params
// ---------------------------------------------------------------------------

export interface ReferralCodeListParams {
  search?: string;
  page?: number;
  limit?: number;
  codeType?: "user_generated" | "promotional";
}
