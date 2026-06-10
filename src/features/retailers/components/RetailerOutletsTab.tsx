import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  useRetailerOutletsQuery,
  useSetOutletPublishedMutation,
  useSetOutletPrimaryMutation,
} from "../api/retailer-queries";
import type { AdminOutlet } from "../api/retailer-api";

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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
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
            {isPending ? <Loader2 className="size-4 animate-spin" /> : confirmLabel}
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
  const { data: outlets, isLoading, isError } = useRetailerOutletsQuery(retailerId);
  const publishMutation = useSetOutletPublishedMutation(retailerId);
  const primaryMutation = useSetOutletPrimaryMutation(retailerId);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Failed to load outlets.</p>
      </div>
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

  const dialogProps: Omit<ConfirmDialogProps, "open"> = pendingAction?.kind === "set-primary"
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
            The primary branch sets the store's live position. Publish flags only affect customers once multi-outlet discovery ships.
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
            const isThisPrimaryPending =
              isPrimaryMutationPending &&
              primaryMutation.variables === outlet.id;

            return (
              <Card key={outlet.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 leading-tight">{outlet.name}</span>
                    {outlet.isPrimary && (
                      <span className="inline-flex items-center rounded-full bg-[#CDFF00]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                        Primary
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {addressLine && (
                    <p className="text-muted-foreground">{addressLine}</p>
                  )}

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

                  {!outlet.isPrimary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      disabled={!canWrite || isPrimaryMutationPending || isThisPrimaryPending}
                      onClick={() => setPendingAction({ kind: "set-primary", outlet })}
                    >
                      {isThisPrimaryPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Set as primary"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
