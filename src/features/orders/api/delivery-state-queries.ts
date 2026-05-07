import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDeliveryState,
  resolveStuckDelivery,
  type ResolveStuckRequest,
} from "./delivery-state-api";
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
