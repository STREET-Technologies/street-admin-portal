import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useRetailerQuery } from "../api/retailer-queries";
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
  const { data: retailer, isLoading, isError, refetch } =
    useRetailerQuery(retailerId);

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
        subtitle={retailer.email || undefined}
        status={retailer.status}
        avatarFallback={retailer.name.charAt(0).toUpperCase()}
      />

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

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
