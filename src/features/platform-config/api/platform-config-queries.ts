import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformConfig, updatePlatformConfig } from "./platform-config-api";

export const platformConfigKeys = {
  all: ["platform-config"] as const,
};

export function usePlatformConfigQuery() {
  return useQuery({
    queryKey: platformConfigKeys.all,
    queryFn: getPlatformConfig,
  });
}

export function useUpdatePlatformConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlatformConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: platformConfigKeys.all }),
  });
}
