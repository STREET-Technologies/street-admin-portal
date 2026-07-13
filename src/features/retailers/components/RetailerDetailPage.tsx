import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/shared/UnderlineTabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { EditableField } from "@/components/shared/EditableField";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDate } from "@/lib/format-utils";
import {
  useRetailerQuery,
  useUpdateRetailerMutation,
  useSetRetailerActiveMutation,
  useResyncRetailerFromShopifyMutation,
} from "../api/retailer-queries";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { useTabParam } from "@/hooks/use-tab-param";
import { RetailerOverviewTab } from "./RetailerOverviewTab";
import { RetailerOrdersTab } from "./RetailerOrdersTab";
import { RetailerStaffTab } from "./RetailerStaffTab";
import { RetailerNotesTab } from "./RetailerNotesTab";
import { RetailerActivityTab } from "./RetailerActivityTab";
import { RetailerBillingTab } from "./RetailerBillingTab";
import { RetailerOutletsTab } from "./RetailerOutletsTab";

interface RetailerDetailPageProps {
  retailerId: string;
}

export function RetailerDetailPage({ retailerId }: RetailerDetailPageProps) {
  const { canWrite } = useAdminRole();
  const { data: retailer, isLoading, isError, refetch } =
    useRetailerQuery(retailerId);
  const updateRetailer = useUpdateRetailerMutation(retailerId);
  const setActive = useSetRetailerActiveMutation(retailerId);
  const resyncFromShopify = useResyncRetailerFromShopifyMutation(retailerId);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [activeTab, setActiveTab] = useTabParam("overview");

  async function handleOnlineToggle(checked: boolean) {
    setIsTogglingOnline(true);
    try {
      await updateRetailer.mutateAsync({ isOnline: checked });
      toast.success(checked ? "Retailer set to online" : "Retailer set to offline");
    } catch {
      toast.error("Failed to update online status");
    } finally {
      setIsTogglingOnline(false);
    }
  }

  async function handleSetActive(isActive: boolean) {
    try {
      await setActive.mutateAsync(isActive);
      toast.success(
        isActive
          ? "Brand reactivated — visible in discovery again"
          : "Brand deactivated — hidden from discovery",
      );
    } catch {
      toast.error("Failed to update brand active state");
    } finally {
      setConfirmDeactivate(false);
    }
  }

  async function handleResyncFromShopify() {
    try {
      await resyncFromShopify.mutateAsync();
      toast.success("Store details re-synced from Shopify");
    } catch {
      toast.error("Could not re-sync from Shopify. Please try again.");
    }
  }

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isError || !retailer) {
    return (
      <ErrorState
        title="Retailer not found"
        message="The retailer could not be loaded. It may have been removed or the ID is incorrect."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <BackButton to="/retailers" label="Retailers" />

      {/* Header */}
      <EntityDetailHeader
        title={retailer.name}
        status={retailer.status}
        avatarUrl={retailer.logo ?? undefined}
        avatarFallback={retailer.name.charAt(0).toUpperCase()}
      >
        {/* Re-sync the whole store's brand/contact/locale from Shopify. Lives
            beside the Online toggle because it's a store-level action, not a
            single business-detail field. Shopify vendors + write access only. */}
        {canWrite && retailer.storeUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleResyncFromShopify()}
            disabled={resyncFromShopify.isPending}
            title="Re-pull store name, branding and contact details from Shopify. Address syncs separately from Shopify locations."
          >
            <RefreshCw
              className={`mr-2 h-3.5 w-3.5 ${
                resyncFromShopify.isPending ? "animate-spin" : ""
              }`}
            />
            {resyncFromShopify.isPending ? "Re-syncing…" : "Re-sync from Shopify"}
          </Button>
        )}

        <div className={`flex h-8 items-center gap-2 rounded-lg border px-3 transition-colors ${retailer.isOnline ? "border-foreground bg-[#CDFF00]/5 dark:border-[#CDFF00]/50" : "border-border"}`}>
          {isTogglingOnline && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
          <Switch
            id="header-online-toggle"
            checked={retailer.isOnline}
            onCheckedChange={(checked) => void handleOnlineToggle(checked)}
            disabled={isTogglingOnline || !canWrite}
            size="sm"
            className="data-[state=checked]:bg-[#CDFF00] dark:data-[state=checked]:bg-[#CDFF00]"
          />
          <Label
            htmlFor="header-online-toggle"
            className={`cursor-pointer text-sm font-medium transition-colors ${retailer.isOnline ? "text-foreground" : "text-muted-foreground"}`}
          >
            {retailer.isOnline ? "Online" : "Offline"}
          </Label>
        </div>

        {/* Brand-level discovery gate (TT-355). Deactivating hides the whole
            brand — every outlet — from the customer app, so it confirms first. */}
        <div className={`flex h-8 items-center gap-2 rounded-lg border px-3 transition-colors ${retailer.isActive ? "border-border" : "border-destructive/50 bg-destructive/5"}`}>
          {setActive.isPending && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
          <Switch
            id="header-active-toggle"
            checked={retailer.isActive}
            onCheckedChange={(checked) => {
              if (checked) {
                void handleSetActive(true);
              } else {
                setConfirmDeactivate(true);
              }
            }}
            disabled={setActive.isPending || !canWrite}
            size="sm"
          />
          <Label
            htmlFor="header-active-toggle"
            className={`cursor-pointer text-sm font-medium transition-colors ${retailer.isActive ? "text-foreground" : "text-destructive"}`}
          >
            {retailer.isActive ? "Active" : "Deactivated"}
          </Label>
        </div>
      </EntityDetailHeader>

      <Dialog
        open={confirmDeactivate}
        onOpenChange={(open) => {
          if (!open) setConfirmDeactivate(false);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Deactivate {retailer.name}?</DialogTitle>
            <DialogDescription>
              This hides the entire brand — all outlets — from customer
              discovery until reactivated. The retailer keeps app access and
              existing orders are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeactivate(false)}
              disabled={setActive.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleSetActive(false)}
              disabled={setActive.isPending}
            >
              {setActive.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Deactivate brand"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Identity block — what this retailer is + when they joined / last touched.
          Lives between the header and the tabs so it reads as part of the entity
          identity rather than buried under an Overview card. */}
      <div className="space-y-3">
        <EditableField
          label="Description"
          value={retailer.description || "No description"}
          onSave={async (val) => {
            await updateRetailer.mutateAsync({ description: val });
          }}
          disabled={!canWrite}
        />
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span className="inline-flex gap-1.5">
            <span className="font-medium uppercase tracking-wider">
              Created
            </span>
            <span className="tabular-nums text-foreground/80">
              {formatDate(retailer.createdAt)}
            </span>
          </span>
          <span className="inline-flex gap-1.5">
            <span className="font-medium uppercase tracking-wider">
              Updated
            </span>
            <span className="tabular-nums text-foreground/80">
              {formatDate(retailer.updatedAt)}
            </span>
          </span>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="overview">Overview</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="orders">Orders</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="staff">Staff</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="notes">Notes</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="activity">Activity</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="billing">Billing</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="outlets">Outlets</UnderlineTabsTrigger>
        </UnderlineTabsList>

        <TabsContent value="overview" className="mt-6">
          <RetailerOverviewTab retailer={retailer} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <RetailerOrdersTab retailerId={retailerId} />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <RetailerStaffTab retailerId={retailerId} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <RetailerNotesTab retailerId={retailerId} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <RetailerActivityTab retailerId={retailerId} retailer={retailer} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <RetailerBillingTab retailerId={retailerId} />
        </TabsContent>

        <TabsContent value="outlets" className="mt-6">
          <RetailerOutletsTab retailerId={retailerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
