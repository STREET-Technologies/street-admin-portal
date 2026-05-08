import { api } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Backend response shape — mirrors DeliveryStateAdminController.getDeliveryState
// ---------------------------------------------------------------------------

/** The most recent manual admin resolution against this order, if any. */
export interface ManualResolution {
  resolvedAt: string;
  adminUserId: string | null;
  /** 'delivered' | 'cancelled' (stop_polling does not produce an audit event). */
  resolution: string;
  reason: string | null;
  previousTopic: string | null;
}

export interface DeliveryStateInfo {
  orderId: string;
  provider: string;
  providerJobId: string;
  latestTopic: string;
  reconciliationAttempts: number;
  rtdbClearedAt: string | null;
  updatedAt: string;
  /** TT-166 — populated when an admin has manually resolved this order's stuck delivery. */
  latestManualResolution: ManualResolution | null;
}

export type StuckResolution = "delivered" | "cancelled" | "stop_polling";

export interface ResolveStuckRequest {
  resolution: StuckResolution;
  reason?: string;
}

export interface ResolveStuckResponse {
  success: true;
  resolution: StuckResolution;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch the delivery_state row for an order. Returns null if the order has
 * no delivery_state (e.g. pre-pickup orders before Stuart job creation).
 *
 * @param orderUuid The order UUID (not the display ST-XXXXX id).
 */
export async function getDeliveryState(
  orderUuid: string,
): Promise<DeliveryStateInfo | null> {
  try {
    return await api.get<DeliveryStateInfo>(
      `admin/delivery-state/${orderUuid}`,
    );
  } catch (err: unknown) {
    // 404 is expected for orders that never had a Stuart delivery
    const status = (err as { status?: number })?.status;
    if (status === 404) return null;
    throw err;
  }
}

/**
 * Manually resolve a stuck Stuart delivery (TT-166).
 *
 * - 'delivered' / 'cancelled': fires the full DeliveryStateService.apply
 *   pipeline (RTDB + FCM + downstream side effects). Use 'cancelled' to
 *   trigger the refund flow.
 * - 'stop_polling': sets rtdb_cleared_at on delivery_state so the cron
 *   stops polling without changing order state.
 *
 * @param orderUuid The order UUID.
 */
export async function resolveStuckDelivery(
  orderUuid: string,
  body: ResolveStuckRequest,
): Promise<ResolveStuckResponse> {
  return api.post<ResolveStuckResponse>(
    `admin/delivery-state/${orderUuid}/resolve-stuck`,
    body,
  );
}
