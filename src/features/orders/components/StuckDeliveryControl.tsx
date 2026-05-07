import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  useDeliveryStateQuery,
  useResolveStuckDeliveryMutation,
} from "../api/delivery-state-queries";
import type { StuckResolution } from "../api/delivery-state-api";

const MAX_ATTEMPTS = 12;

const RESOLUTION_LABELS: Record<StuckResolution, string> = {
  delivered:
    "Mark as DELIVERED — fires push to customer + retailer + downstream pipeline",
  cancelled:
    "Mark as CANCELLED — triggers refund pipeline",
  stop_polling:
    "Stop polling only — leave order in current state",
};

interface StuckDeliveryControlProps {
  orderUuid: string;
  orderDisplayId: string;
  /** Order's current top-level status (UPPERCASE). When already terminal we skip rendering. */
  orderStatus: string;
}

/**
 * Renders the stuck-delivery health pill + resolve action when an order's
 * delivery_state shows reconciliation_attempts > 0. Hidden by default for
 * normal orders. When attempts >= MAX_ATTEMPTS, the control displays a red
 * "STUCK" pill and surfaces the manual resolve flow (TT-166).
 */
export function StuckDeliveryControl({
  orderUuid,
  orderDisplayId,
  orderStatus,
}: StuckDeliveryControlProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolution, setResolution] = useState<StuckResolution>("delivered");
  const [reason, setReason] = useState("");

  // Skip the query for terminal orders — there's no recovery to perform.
  const isTerminalStatus = ["DELIVERED", "CANCELLED", "COMPLETED", "REJECTED", "MISSED"].includes(
    orderStatus.toUpperCase(),
  );

  const { data: deliveryState } = useDeliveryStateQuery(orderUuid, {
    enabled: !isTerminalStatus,
  });
  const mutation = useResolveStuckDeliveryMutation(orderUuid, orderDisplayId);

  // Hide the card unless there's something to surface
  if (!deliveryState || deliveryState.reconciliationAttempts === 0) {
    return null;
  }

  const attempts = deliveryState.reconciliationAttempts;
  const isStuck = attempts >= MAX_ATTEMPTS;
  const pillColor = isStuck
    ? "bg-red-100 text-red-800 border-red-300"
    : "bg-amber-100 text-amber-900 border-amber-300";
  const pillLabel = isStuck
    ? `STUCK · ${attempts}/${MAX_ATTEMPTS} attempts`
    : `Reconciling · ${attempts}/${MAX_ATTEMPTS}`;

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
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to resolve stuck delivery",
          );
        },
      },
    );
  }

  return (
    <>
      <Card className={isStuck ? "border-red-300" : "border-amber-300"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle
              className={isStuck ? "size-4 text-red-600" : "size-4 text-amber-600"}
            />
            Delivery reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${pillColor}`}
            >
              {pillLabel}
            </span>
            {deliveryState.rtdbClearedAt && (
              <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                Polling stopped
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">Last webhook topic:</span>{" "}
              {deliveryState.latestTopic}
            </p>
            <p>
              <span className="font-medium">Stuart job:</span>{" "}
              <span className="font-mono">{deliveryState.providerJobId}</span>
            </p>
          </div>

          {isStuck ? (
            <p className="text-xs text-red-700">
              The reconciliation cron has tried {MAX_ATTEMPTS} times over{" "}
              {MAX_ATTEMPTS * 5} minutes without resolving this delivery.
              Manual resolution is required.
            </p>
          ) : (
            <p className="text-xs text-amber-800">
              The reconciliation cron is attempting to recover this delivery
              automatically. It will give up after {MAX_ATTEMPTS} attempts.
            </p>
          )}

          <Button
            size="sm"
            variant={isStuck ? "default" : "outline"}
            onClick={() => setDialogOpen(true)}
            className="w-full"
          >
            <Wrench className="size-4" />
            Manually resolve
          </Button>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Manually resolve stuck delivery — {orderDisplayId}
            </DialogTitle>
            <DialogDescription>
              Pick how to resolve this delivery. Your choice fires the
              corresponding pipeline (push notifications, RTDB updates, refund
              if cancelled). Captured for the audit trail.
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
                  <SelectItem value="delivered">
                    Mark as DELIVERED
                  </SelectItem>
                  <SelectItem value="cancelled">
                    Mark as CANCELLED (triggers refund)
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
                {mutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Confirm resolution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
