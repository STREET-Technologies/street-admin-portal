import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/shared/UnderlineTabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { EditableField } from "@/components/shared/EditableField";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDate } from "@/lib/format-utils";
import { useRetailerQuery, useUpdateRetailerMutation } from "../api/retailer-queries";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { useTabParam } from "@/hooks/use-tab-param";
import { RetailerOverviewTab } from "./RetailerOverviewTab";
import { RetailerOrdersTab } from "./RetailerOrdersTab";
import { RetailerStaffTab } from "./RetailerStaffTab";
import { RetailerNotesTab } from "./RetailerNotesTab";
import { RetailerActivityTab } from "./RetailerActivityTab";
import { RetailerBillingTab } from "./RetailerBillingTab";

interface RetailerDetailPageProps {
  retailerId: string;
}

export function RetailerDetailPage({ retailerId }: RetailerDetailPageProps) {
  const { canWrite } = useAdminRole();
  const { data: retailer, isLoading, isError, refetch } =
    useRetailerQuery(retailerId);
  const updateRetailer = useUpdateRetailerMutation(retailerId);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
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
        avatarFallback={retailer.name.charAt(0).toUpperCase()}
      >
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${retailer.isOnline ? "border-foreground bg-[#CDFF00]/5 dark:border-[#CDFF00]/50" : "border-border"}`}>
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
      </EntityDetailHeader>

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
      </Tabs>
    </div>
  );
}
