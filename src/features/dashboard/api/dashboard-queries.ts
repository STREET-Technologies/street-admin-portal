import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "./dashboard-api";

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
};

/** Platform stats for the home page. Refreshes every 60s while the tab is open. */
export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: getDashboardStats,
    refetchInterval: 60 * 1000,
  });
}
