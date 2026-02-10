import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getReferralCodes,
  getReferralCode,
  updateReferralCode,
  getReferralUses,
  createPromotionalCode,
  getReferralSettings,
  updateReferralSettings,
  type CreatePromotionalCodePayload,
  type UpdateReferralSettingsPayload,
} from "./referral-api";
import { toReferralCodeViewModel, type ReferralCodeListParams } from "../types";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const referralKeys = {
  all: ["referrals"] as const,
  lists: () => [...referralKeys.all, "list"] as const,
  list: (params: ReferralCodeListParams) =>
    [...referralKeys.lists(), params] as const,
  details: () => [...referralKeys.all, "detail"] as const,
  detail: (id: string) => [...referralKeys.details(), id] as const,
  uses: (id: string) => [...referralKeys.detail(id), "uses"] as const,
  settings: () => [...referralKeys.all, "settings"] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

/** Paginated referral code list. Transforms each code to view model. */
export function useReferralCodesQuery(params: ReferralCodeListParams) {
  return useQuery({
    queryKey: referralKeys.list(params),
    queryFn: () => getReferralCodes(params),
    placeholderData: keepPreviousData,
    select: (response) => ({
      ...response,
      data: response.data.map(toReferralCodeViewModel),
    }),
  });
}

/** Single referral code detail. Transforms to view model. */
export function useReferralCodeQuery(id: string) {
  return useQuery({
    queryKey: referralKeys.detail(id),
    queryFn: () => getReferralCode(id),
    enabled: !!id,
    select: toReferralCodeViewModel,
  });
}

/** Referral uses for a specific code. */
export function useReferralUsesQuery(codeId: string) {
  return useQuery({
    queryKey: referralKeys.uses(codeId),
    queryFn: () => getReferralUses(codeId),
    enabled: !!codeId,
  });
}

/** Referral program settings (singleton row). */
export function useReferralSettingsQuery() {
  return useQuery({
    queryKey: referralKeys.settings(),
    queryFn: getReferralSettings,
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

/** Toggle a referral code's active status. */
export function useToggleReferralCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateReferralCode(id, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: referralKeys.all,
      });
    },
  });
}

/** Create a promotional referral code. */
export function useCreatePromotionalCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionalCodePayload) =>
      createPromotionalCode(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: referralKeys.lists(),
      });
    },
  });
}

/** Update referral settings. */
export function useUpdateReferralSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReferralSettingsPayload) =>
      updateReferralSettings(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: referralKeys.settings(),
      });
    },
  });
}
