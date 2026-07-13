import { api } from "@/lib/api-client";

/** Mirrors DashboardStats in street-backend admin-dashboard.service.ts (TT-358). */
export interface DashboardStats {
  orders: {
    today: number;
    week: number;
    gmvTodayGbp: number;
    gmvWeekGbp: number;
    awaitingAcceptance: number;
    inProgress: number;
    stuck: number;
    pendingReturns: number;
  };
  users: {
    total: number;
    newThisWeek: number;
  };
  vendors: {
    total: number;
    active: number;
    offline: number;
    deactivated: number;
    uninstalled: number;
  };
}

export function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>("admin/dashboard/stats");
}
