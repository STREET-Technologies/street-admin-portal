import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  useRetailerOutletsQuery,
  useSetOutletPublishedMutation,
  useSetOutletActiveMutation,
  useSetOutletPrimaryMutation,
} from "../api/retailer-queries";
import type {
  AdminOutlet,
  AddressValidationVerdict,
} from "../api/retailer-api";

// Explains the courier-bookability failure and how to fix it (TT-397).
// Only 'invalid_postcode' and 'postcode_mismatch' warrant a warning — never
// alarm on 'valid', 'unknown', or null (unverified).
const ADDRESS_VERDICT_COPY: Record<string, string> = {
  invalid_postcode:
    "Postcode does not exist or was terminated — Stuart deliveries from this outlet will fail. Correct the address in the store's Shopify admin; it re-checks on the next sync.",
  postcode_mismatch:
    "Street and postcode don't match — Stuart deliveries from this outlet may fail. Correct the address in the store's Shopify admin; it re-checks on the next sync.",
};

function getAddressWarning(verdict: AddressValidationVerdict): string | null {
  return verdict != null ? (ADDRESS_VERDICT_COPY[verdict] ?? null) : null;
}

// ---------------------------------------------------------------------------
// Confirm dialog — used for both "set as primary" and "unpublish primary"
// ---------------------------------------------------------------------------

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------

interface RetailerOutletsTabProps {
  retailerId: string;
}

type PendingAction =
  | { kind: "set-primary"; outlet: AdminOutlet }
  | { kind: "unpublish-primary"; outlet: AdminOutlet };

export function RetailerOutletsTab({ retailerId }: RetailerOutletsTabProps) {
  const { canWrite } = useAdminRole();
  const {
    data: outlets,
    isLoading,
    isError,
    refetch,
  } = useRetailerOutletsQuery(retailerId);
  const publishMutation = useSetOutletPublishedMutation(retailerId);
  const activeMutation = useSetOutletActiveMutation(retailerId);
  const primaryMutation = useSetOutletPrimaryMutation(retailerId);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load outlets"
        message="There was a problem fetching this retailer's outlets. Please try again."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!outlets?.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="No outlets captured"
        description="This retailer installed before multi-location support — outlets will appear after their next app sync."
      />
    );
  }

  // Publish toggle handler — intercepts the "unpublish primary" case
  async function handlePublishToggle(outlet: AdminOutlet, checked: boolean) {
    if (!checked && outlet.isPrimary) {
      setPendingAction({ kind: "unpublish-primary", outlet });
      return;
    }
    await doPublish(outlet.id, checked);
  }

  async function doPublish(outletId: string, isPublished: boolean) {
    try {
      await publishMutation.mutateAsync({ outletId, isPublished });
      toast.success(isPublished ? "Outlet published" : "Outlet unpublished");
    } catch {
      toast.error("Failed to update outlet");
    }
  }

  // Active toggle — pause/resume a branch without unpublishing it (TT-281).
  // Independent of primary/address, so no confirmation needed.
  async function handleActiveToggle(outlet: AdminOutlet, checked: boolean) {
    try {
      await activeMutation.mutateAsync({
        outletId: outlet.id,
        isActive: checked,
      });
      toast.success(checked ? "Outlet activated" : "Outlet paused");
    } catch {
      toast.error("Failed to update outlet");
    }
  }

  async function handleSetPrimary(outlet: AdminOutlet) {
    try {
      await primaryMutation.mutateAsync(outlet.id);
      toast.success(`${outlet.name} is now the primary outlet`);
    } catch {
      toast.error("Failed to set primary outlet");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleConfirm() {
    if (!pendingAction) return;
    if (pendingAction.kind === "set-primary") {
      await handleSetPrimary(pendingAction.outlet);
    } else {
      await doPublish(pendingAction.outlet.id, false);
      setPendingAction(null);
    }
  }

  function handleCancel() {
    setPendingAction(null);
  }

  const isPrimaryMutationPending = primaryMutation.isPending;

  const dialogProps: Omit<ConfirmDialogProps, "open"> =
    pendingAction?.kind === "set-primary"
      ? {
          title: "Move live position?",
          body: `This makes ${pendingAction.outlet.name} the store's primary branch. The store's customer-facing address and map position move here immediately.`,
          confirmLabel: "Set as primary",
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          isPending: isPrimaryMutationPending,
        }
      : pendingAction?.kind === "unpublish-primary"
        ? {
            title: "Unpublish the primary branch?",
            body: "The primary branch controls where this store appears to customers. Unpublishing it does not hide the store; set a different branch as primary first if you want to move it.",
            confirmLabel: "Unpublish",
            onConfirm: handleConfirm,
            onCancel: handleCancel,
            isPending: publishMutation.isPending,
          }
        : {
            title: "",
            body: "",
            onConfirm: handleConfirm,
            onCancel: handleCancel,
          };

  return (
    <>
      <ConfirmDialog open={pendingAction !== null} {...dialogProps} />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {outlets.length} outlet{outlets.length === 1 ? "" : "s"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground/70">
            The primary branch sets the store's live position. Publish flags
            only affect customers once multi-outlet discovery ships.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outlets.map((outlet) => {
            const addressLine = [outlet.address, outlet.city, outlet.postcode]
              .filter(Boolean)
              .join(", ");
            const isPublishPending =
              publishMutation.isPending &&
              publishMutation.variables?.outletId === outlet.id;
            const isActivePending =
              activeMutation.isPending &&
              activeMutation.variables?.outletId === outlet.id;
            const isThisPrimaryPending =
              isPrimaryMutationPending &&
              primaryMutation.variables === outlet.id;
            const addressWarning = getAddressWarning(
              outlet.addressValidationVerdict,
            );

            return (
              <div key={outlet.id} className="rounded-md border bg-card p-5">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 leading-tight">{outlet.name}</span>
                  {outlet.isPrimary && (
                    <span className="inline-flex items-center rounded-full bg-[#CDFF00]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                      Primary
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {addressLine && (
                    <p className="text-muted-foreground">{addressLine}</p>
                  )}

                  {/* Deep-links to the Orders tab pre-filtered to this branch
                      (TT-450), rather than duplicating the orders table here.
                      This tab configures outlets; orders stay in one place. */}
                  <Link
                    to="/retailers/$retailerId"
                    params={{ retailerId }}
                    search={{ tab: "orders", ordersOutletId: outlet.id }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View orders
                    <ArrowRight className="size-3" />
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wider ${
                        outlet.isPublished
                          ? "bg-[hsl(var(--status-delivered-bg))] text-[hsl(var(--status-delivered-fg))]"
                          : "bg-[hsl(var(--status-cancelled-bg))] text-[hsl(var(--status-cancelled-fg))]"
                      }`}
                    >
                      {outlet.isPublished ? "PUBLISHED" : "DORMANT"}
                    </span>

                    {outlet.latitude == null && (
                      <span
                        className="inline-flex items-center rounded-full bg-[hsl(var(--status-stuck-bg))] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[hsl(var(--status-stuck-fg))]"
                        title="Won't appear in discovery until geocoded"
                      >
                        NO COORDINATES
                      </span>
                    )}

                    {addressWarning && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="destructive"
                            className="cursor-default"
                          >
                            Address not courier-bookable
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64">
                          {addressWarning}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {outlet.isPublished ? "Published" : "Dormant"}
                    </span>
                    <Switch
                      checked={outlet.isPublished}
                      onCheckedChange={(checked) =>
                        void handlePublishToggle(outlet, checked)
                      }
                      disabled={!canWrite || isPublishPending}
                      size="sm"
                      className="data-[state=checked]:bg-[#CDFF00] dark:data-[state=checked]:bg-[#CDFF00]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {outlet.isActive ? "Active" : "Paused"}
                    </span>
                    <Switch
                      checked={outlet.isActive}
                      onCheckedChange={(checked) =>
                        void handleActiveToggle(outlet, checked)
                      }
                      disabled={!canWrite || isActivePending}
                      size="sm"
                      className="data-[state=checked]:bg-[#CDFF00] dark:data-[state=checked]:bg-[#CDFF00]"
                    />
                  </div>

                  {!outlet.isPrimary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      disabled={
                        !canWrite ||
                        isPrimaryMutationPending ||
                        isThisPrimaryPending
                      }
                      onClick={() =>
                        setPendingAction({ kind: "set-primary", outlet })
                      }
                    >
                      {isThisPrimaryPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Set as primary"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
