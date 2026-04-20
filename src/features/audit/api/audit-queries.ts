import { useQuery } from "@tanstack/react-query";
import { getUserActivity, getVendorActivity } from "./audit-api";

export const auditKeys = {
  all: ["audit"] as const,
  user: (id: string, page: number) =>
    [...auditKeys.all, "user", id, page] as const,
  vendor: (id: string, page: number) =>
    [...auditKeys.all, "vendor", id, page] as const,
};

export function useUserActivityQuery(userId: string, page = 1) {
  return useQuery({
    queryKey: auditKeys.user(userId, page),
    queryFn: () => getUserActivity(userId, page),
    enabled: !!userId,
  });
}

export function useVendorActivityQuery(vendorId: string, page = 1) {
  return useQuery({
    queryKey: auditKeys.vendor(vendorId, page),
    queryFn: () => getVendorActivity(vendorId, page),
    enabled: !!vendorId,
  });
}
