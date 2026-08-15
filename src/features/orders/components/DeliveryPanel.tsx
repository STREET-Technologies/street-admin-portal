import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  MoreHorizontal,
  Truck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/shared/CopyButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format-utils";
import {
  useDeliveryStateQuery,
  useResolveStuckDeliveryMutation,
  useRtdbRepairMutations,
} from "../api/delivery-state-queries";
import type {
  DeliveryStateInfo,
  StuckResolution,
} from "../api/delivery-state-api";

const MAX_ATTEMPTS = 12;

const TERMINAL_ORDER_STATUSES = [
  "DELIVERED",
  "CANCELLED",
  "COMPLETED",
  "RETURNED",
  "REJECTED",
  "MISSED",
];

/** Stuart webhook topic → friendly label + a StatusBadge-compatible status. */
const TOPIC_META: Record<string, { label: string; badge: string }> = {
  package_created: { label: "Job created", badge: "pending" },
  courier_assigned: { label: "Courier assigned", badge: "confirmed" },
  courier_moving: { label: "Courier en route", badge: "in_delivery" },
  courier_arriving: { label: "Courier arriving", badge: "in_delivery" },
  package_delivered: { label: "Delivered", badge: "delivered" },
  package_canceled: { label: "Cancelled", badge: "cancelled" },
  package_returning: { label: "Returning to store", badge: "returning" },
  package_returned: { label: "Returned", badge: "returned" },
};

function topicMeta(topic: string): { label: string; badge: string } {
  return (
    TOPIC_META[topic] ?? {
      label: topic.replace(/_/g, " "),
      badge: topic,
    }
  );
}

const RESOLUTION_LABELS: Record<StuckResolution, string> = {
  delivered:
    "Mark as DELIVERED — fires push to customer + retailer + downstream pipeline",
  cancelled:
    "Mark as CANCELLED — calls Stuart cancel, then triggers our refund pipeline",
  stop_polling: "Stop polling only — leave order in current state",
};

interface DeliveryPanelProps {
  orderUuid: string;
  orderDisplayId: string;
  /** Order's current top-level status (UPPERCASE). */
  orderStatus: string;
}

/**
 * Unified delivery panel (TT-354). Replaces the old dead DeliverySection
 * (which parsed a deliveryDetails JSONB that never existed) and the separate
 * reconciliation card. Reads live courier state from delivery_state and folds
 * the stuck-delivery health + resolve controls into one coherent section.
 */
export function DeliveryPanel({
  orderUuid,
  orderDisplayId,
  orderStatus,
}: DeliveryPanelProps) {
  const { data: ds, isLoading } = useDeliveryStateQuery(orderUuid);

  return (
    <section>
      <h2 className="flex items-center gap-2 text-base font-semibold leading-none">
        <Truck className="size-4" />
        Delivery
        {ds && (
          <span className="ml-auto">
            <StatusBadge status={topicMeta(ds.latestTopic).badge} size="sm" />
          </span>
        )}
      </h2>
      <div className="mt-4 border-t pt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading delivery…</p>
        ) : !ds ? (
          <p className="text-sm text-muted-foreground">
            No courier job — this order hasn't been dispatched to Stuart.
          </p>
        ) : (
          <DeliveryBody
            ds={ds}
            orderUuid={orderUuid}
            orderDisplayId={orderDisplayId}
            orderStatus={orderStatus}
          />
        )}
      </div>
    </section>
  );
}

function DeliveryBody({
  ds,
  orderUuid,
  orderDisplayId,
  orderStatus,
}: {
  ds: DeliveryStateInfo;
  orderUuid: string;
  orderDisplayId: string;
  orderStatus: string;
}) {
  const hasCourier = Boolean(ds.courier.name || ds.courier.phone);
  const hasLocation =
    ds.courier.latitude != null && ds.courier.longitude != null;
  const mapUrl = hasLocation
    ? `https://www.google.com/maps?q=${ds.courier.latitude},${ds.courier.longitude}`
    : null;

  return (
    <div className="space-y-3">
      {/* Reconciliation first (TT-473) — when a delivery is stuck or was
          manually resolved, that is what support opened the order for. Only
          renders when there is something to show. */}
      <ReconciliationBlock
        ds={ds}
        orderUuid={orderUuid}
        orderDisplayId={orderDisplayId}
        orderStatus={orderStatus}
      />

      {/* Courier + ETAs — one compact key/value line each, wrapping only
          when the column is narrow. */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground leading-6">
          Courier
        </dt>
        <dd className="flex flex-wrap items-center gap-x-3 leading-6">
          {hasCourier ? (
            <>
              <span>{ds.courier.name ?? "—"}</span>
              {ds.courier.phone && (
                <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
                  {ds.courier.phone}
                  <CopyButton
                    value={ds.courier.phone}
                    label="Copy courier phone"
                  />
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Not assigned yet</span>
          )}
        </dd>

        {(ds.estimatedPickupAt || ds.estimatedDeliveryAt) && (
          <>
            <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground leading-6">
              ETA
            </dt>
            <dd className="flex flex-wrap gap-x-4 tabular-nums leading-6">
              {ds.estimatedPickupAt && (
                <span>
                  <span className="text-muted-foreground">Pickup </span>
                  {formatDateTime(ds.estimatedPickupAt)}
                </span>
              )}
              {ds.estimatedDeliveryAt && (
                <span>
                  <span className="text-muted-foreground">Delivery </span>
                  {formatDateTime(ds.estimatedDeliveryAt)}
                </span>
              )}
            </dd>
          </>
        )}
      </dl>

      {/* Location + tracking + POD links */}
      {(mapUrl || ds.trackingUrl || ds.podSignatureUrl) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <MapPin className="size-3.5" />
              Courier location
              {ds.courier.locationAt && (
                <span className="text-xs text-muted-foreground">
                  (seen {formatDateTime(ds.courier.locationAt)})
                </span>
              )}
            </a>
          )}
          {ds.trackingUrl && (
            <a
              href={ds.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Stuart tracking
            </a>
          )}
          {ds.podSignatureUrl && (
            <a
              href={ds.podSignatureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Proof of delivery
            </a>
          )}
        </div>
      )}

      {/* Provider job reference */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>
          Provider:{" "}
          <span className="text-foreground/80 capitalize">{ds.provider}</span>
        </span>
        <span>
          Job:{" "}
          <span className="font-mono text-foreground/80">
            {ds.providerJobId || "—"}
          </span>
        </span>
        {ds.lastEventOccurredAt && (
          <span>
            Last update:{" "}
            <span className="tabular-nums text-foreground/80">
              {formatDateTime(ds.lastEventOccurredAt)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reconciliation health + resolve + RTDB tools (folded in from TT-166)
// ---------------------------------------------------------------------------

function ReconciliationBlock({
  ds,
  orderUuid,
  orderDisplayId,
  orderStatus,
}: {
  ds: DeliveryStateInfo;
  orderUuid: string;
  orderDisplayId: string;
  orderStatus: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolution, setResolution] = useState<StuckResolution>("delivered");
  const [reason, setReason] = useState("");

  const mutation = useResolveStuckDeliveryMutation(orderUuid, orderDisplayId);
  const rtdbRepair = useRtdbRepairMutations(orderUuid);

  const attempts = ds.reconciliationAttempts;
  const resolved = ds.latestManualResolution;
  const isStuck = attempts >= MAX_ATTEMPTS;
  const isOrderTerminal = TERMINAL_ORDER_STATUSES.includes(
    orderStatus.toUpperCase(),
  );

  // Nothing to surface — order reconciled normally and was never resolved.
  const showReconciliation = attempts > 0 || Boolean(resolved);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { resolution, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(
            resolution === "stop_polling"
              ? "Polling stopped for this order"
              : `Order resolved as ${resolution.toUpperCase()}`,
          );
          setReason("");
          setDialogOpen(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to resolve delivery",
          ),
      },
    );
  }

  // One line (TT-473): state on the left, actions on the right. The RTDB
  // repair tools sit behind a menu — rare, and two ghost buttons made this
  // read as a card competing with the delivery facts above it.
  const state = resolved ? (
    <>
      <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
      <span>
        Resolved as{" "}
        <span className="font-medium uppercase">{resolved.resolution}</span>
        <span className="text-muted-foreground tabular-nums">
          {" · "}
          {formatDateTime(resolved.resolvedAt)}
          {resolved.adminUserId ? (
            <>
              {" · admin "}
              <span className="font-mono">
                {resolved.adminUserId.slice(0, 8)}
              </span>
            </>
          ) : null}
          {resolved.previousTopic ? (
            <>
              {" · was "}
              <span className="font-mono">{resolved.previousTopic}</span>
            </>
          ) : null}
          {resolved.reason ? (
            <span className="italic" title={resolved.reason}>
              {" · “"}
              {resolved.reason}
              {"”"}
            </span>
          ) : null}
        </span>
      </span>
    </>
  ) : (
    <>
      <AlertTriangle
        className={
          isStuck
            ? "size-4 shrink-0 text-destructive"
            : "size-4 shrink-0 text-muted-foreground"
        }
      />
      <span>
        <span className={isStuck ? "font-medium" : undefined}>
          {isStuck ? "Delivery stuck" : "Delivery reconciling"}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {" · "}
          {attempts}/{MAX_ATTEMPTS} attempts
          {isStuck ? " · manual resolution required" : ""}
          {ds.rtdbClearedAt ? " · polling stopped" : ""}
        </span>
      </span>
    </>
  );

  return (
    <>
      {showReconciliation && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-3 text-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2 [&>span]:truncate">
            {state}
          </div>
          <div className="flex items-center gap-1">
            {!isOrderTerminal && (
              <Button
                size="sm"
                variant={isStuck ? "default" : "outline"}
                onClick={() => setDialogOpen(true)}
              >
                <Wrench className="mr-1.5 size-3.5" />
                Manually resolve
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delivery repair tools"
                >
                  {rtdbRepair.resync.isPending ||
                  rtdbRepair.forceClear.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={rtdbRepair.resync.isPending}
                  onSelect={() =>
                    rtdbRepair.resync.mutate(undefined, {
                      onSuccess: (r) =>
                        toast.success(
                          r.synced
                            ? "RTDB re-synced from delivery_state"
                            : "Nothing to sync",
                        ),
                      onError: (err) =>
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "RTDB re-sync failed",
                        ),
                    })
                  }
                >
                  Re-sync RTDB
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={rtdbRepair.forceClear.isPending}
                  onSelect={() =>
                    rtdbRepair.forceClear.mutate(undefined, {
                      onSuccess: (r) =>
                        toast.success(
                          r.cleared.length > 0
                            ? `Cleared ${r.cleared.length} RTDB path${r.cleared.length === 1 ? "" : "s"}`
                            : "No RTDB paths to clear",
                        ),
                      onError: (err) =>
                        toast.error(
                          err instanceof Error
                            ? err.message
                            : "RTDB clear failed",
                        ),
                    })
                  }
                >
                  Force-clear RTDB
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Manually resolve delivery — {orderDisplayId}
            </DialogTitle>
            <DialogDescription>
              Pick how to resolve this delivery. Your choice fires the
              corresponding pipeline (push notifications, RTDB updates, refund
              if cancelled, Stuart-side cancel). Captured for the audit trail.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Select
                value={resolution}
                onValueChange={(v) => setResolution(v as StuckResolution)}
              >
                <SelectTrigger id="resolution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivered">Mark as DELIVERED</SelectItem>
                  <SelectItem value="cancelled">
                    Mark as CANCELLED (Stuart cancel + refund)
                  </SelectItem>
                  <SelectItem value="stop_polling">
                    Stop polling only (no state change)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {RESOLUTION_LABELS[resolution]}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional, max 500 chars)</Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="e.g. Confirmed delivery with retailer over phone, courier app showed delivered"
                value={reason}
                maxLength={500}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Confirm resolution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
