import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDeliveryState,
  resolveStuckDelivery,
  resyncRtdb,
  forceClearRtdb,
  type ResolveStuckRequest,
} from "./delivery-state-api";
import { cancelOrderByAdmin, refundOrderByAdmin } from "./order-api";
import { orderKeys } from "./order-queries";

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const deliveryStateKeys = {
  all: ["delivery-state"] as const,
  detail: (orderUuid: string) =>
    [...deliveryStateKeys.all, "detail", orderUuid] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Fetch delivery_state for the given order UUID.
 * Returns null when no row exists (404 is normalised by getDeliveryState).
 */
export function useDeliveryStateQuery(
  orderUuid: string | undefined,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: deliveryStateKeys.detail(orderUuid ?? ""),
    queryFn: () => getDeliveryState(orderUuid!),
    enabled: Boolean(orderUuid) && (options.enabled ?? true),
    refetchInterval: 30 * 1000, // refresh every 30s so the badge stays current
  });
}

/**
 * Mutation to resolve a stuck delivery. Invalidates both delivery_state
 * and the order detail cache so the page reflects the change.
 */
export function useResolveStuckDeliveryMutation(
  orderUuid: string,
  orderDisplayId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ResolveStuckRequest) =>
      resolveStuckDelivery(orderUuid, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: deliveryStateKeys.detail(orderUuid),
      });
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detailByOrderId(orderDisplayId),
      });
    },
  });
}

/** Admin order cancel (TT-357). Refreshes the order detail, lists, and delivery state. */
export function useCancelOrderMutation(
  orderUuid: string,
  orderDisplayId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      cancelOrderByAdmin(orderDisplayId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detailByOrderId(orderDisplayId),
      });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: deliveryStateKeys.detail(orderUuid),
      });
    },
  });
}

/** Admin ad-hoc refund (TT-357). Order status is unchanged; refresh detail anyway. */
export function useRefundOrderMutation(orderDisplayId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      refundOrderByAdmin(orderDisplayId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detailByOrderId(orderDisplayId),
      });
    },
  });
}

/** RTDB repair tools (TT-357) — previously SSH-only. */
export function useRtdbRepairMutations(orderUuid: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: deliveryStateKeys.detail(orderUuid),
    });

  const resync = useMutation({
    mutationFn: () => resyncRtdb(orderUuid),
    onSuccess: invalidate,
  });
  const forceClear = useMutation({
    mutationFn: () => forceClearRtdb(orderUuid),
    onSuccess: invalidate,
  });
  return { resync, forceClear };
}
