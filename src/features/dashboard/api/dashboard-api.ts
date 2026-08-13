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
  /**
   * Faults a support person can act on (TT-451). Each was already shown as a
   * per-row badge somewhere and so never seen in aggregate.
   */
  attention: {
    failedBilling: number;
    unbookableUserAddresses: number;
    /** Carries the retailer because there is no global outlets screen. */
    outlets: Array<{
      outletId: string;
      outletName: string;
      vendorId: string;
      vendorName: string;
      reason: "no_coordinates" | "address_unbookable";
    }>;
  };
}

export function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>("admin/dashboard/stats");
}
