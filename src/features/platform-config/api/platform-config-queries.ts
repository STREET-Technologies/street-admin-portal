import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlatformConfig,
  getVendorCategories,
  updatePlatformConfig,
} from "./platform-config-api";

export const platformConfigKeys = {
  all: ["platform-config"] as const,
  vendorCategories: ["platform-config", "vendor-categories"] as const,
};

export function usePlatformConfigQuery() {
  return useQuery({
    queryKey: platformConfigKeys.all,
    queryFn: getPlatformConfig,
  });
}

/** Canonical vendor categories. Effectively static — cache for the session. */
export function useVendorCategoriesQuery() {
  return useQuery({
    queryKey: platformConfigKeys.vendorCategories,
    queryFn: getVendorCategories,
    staleTime: Infinity,
  });
}

export function useUpdatePlatformConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlatformConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: platformConfigKeys.all }),
  });
}
