import { useState } from "react";
import { Ban, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  useCancelOrderMutation,
  useRefundOrderMutation,
} from "../api/delivery-state-queries";

/**
 * Header actions for the order detail page (TT-357): cancel + goodwill refund.
 *
 * Cancel handles both pre-dispatch and in-delivery orders — the backend picks
 * the pipeline. Refund creates a full Shopify refund without changing order
 * state (ADMIN role only, matching the backend guard). Both are financial
 * actions, so each requires a written reason and confirms in a dialog.
 */

// Mirrors the backend CANCELLABLE set in OrdersService.cancelOrderByAdmin.
const CANCELLABLE_STATUSES = new Set([
  "PENDING",
  "AWAITING_ACCEPTANCE",
  "MISSED",
  "CONFIRMED",
  "IN_PACKING",
  "READY_FOR_DELIVERY",
  "WAITING_FOR_PICKUP",
  "IN_DELIVERY",
]);

const MIN_REASON_LENGTH = 5;

interface OrderActionsControlProps {
  orderUuid: string;
  orderDisplayId: string;
  orderStatus: string;
  paymentStatus: string;
}

type PendingAction = "cancel" | "refund" | null;

export function OrderActionsControl({
  orderUuid,
  orderDisplayId,
  orderStatus,
  paymentStatus,
}: OrderActionsControlProps) {
  const { canWrite, isAdmin } = useAdminRole();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [reason, setReason] = useState("");

  const cancelMutation = useCancelOrderMutation(orderUuid, orderDisplayId);
  const refundMutation = useRefundOrderMutation(orderDisplayId);

  const canCancel =
    canWrite && CANCELLABLE_STATUSES.has(orderStatus.toUpperCase());
  const canRefund = isAdmin && paymentStatus.toUpperCase() === "PAID";

  if (!canCancel && !canRefund) return null;

  const isPending = cancelMutation.isPending || refundMutation.isPending;

  function closeDialog() {
    if (isPending) return;
    setPendingAction(null);
    setReason("");
  }

  function handleConfirm() {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) return;

    if (pendingAction === "cancel") {
      cancelMutation.mutate(trimmed, {
        onSuccess: (result) => {
          toast.success(
            result.path === "in_delivery"
              ? "Order cancelled — courier job cancelled and refund pipeline triggered"
              : "Order cancelled and refund/void issued",
          );
          setPendingAction(null);
          setReason("");
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to cancel order",
          ),
      });
    } else if (pendingAction === "refund") {
      refundMutation.mutate(trimmed, {
        onSuccess: (result) => {
          toast.success(
            `Refund of ${result.currency} ${result.amount.toFixed(2)} created in Shopify`,
          );
          setPendingAction(null);
          setReason("");
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to create refund",
          ),
      });
    }
  }

  return (
    <>
      {canRefund && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPendingAction("refund")}
        >
          <Undo2 className="mr-2 size-3.5" />
          Refund
        </Button>
      )}
      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setPendingAction("cancel")}
        >
          <Ban className="mr-2 size-3.5" />
          Cancel order
        </Button>
      )}

      {/* AlertDialog, not Dialog: both branches move money and cannot be
          undone. It is modal against outside-click and Escape, so a stray
          click cannot dismiss a half-typed reason (TT-446). */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "cancel"
                ? `Cancel order ${orderDisplayId}?`
                : `Refund order ${orderDisplayId}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "cancel"
                ? "The customer is refunded (or the authorization voided), the Shopify order is cancelled, and any active courier job is cancelled. This cannot be undone."
                : "Creates a full refund in Shopify without changing the order status. Use for goodwill refunds on completed orders. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Reason (required)
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                pendingAction === "cancel"
                  ? "e.g. Customer requested cancellation over the phone"
                  : "e.g. Goodwill refund — late delivery complaint"
              }
              rows={3}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Recorded on the Shopify refund and in the audit trail.
            </p>
          </div>

          <AlertDialogFooter>
            {/* Plain buttons, not AlertDialogCancel/Action: those close the
                dialog on click, which would dismiss it mid-request and lose
                the typed reason. Closing stays under closeDialog's control. */}
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isPending || reason.trim().length < MIN_REASON_LENGTH}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : pendingAction === "cancel" ? (
                "Cancel order & refund"
              ) : (
                "Create refund"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
