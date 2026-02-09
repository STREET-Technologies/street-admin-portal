import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useRetailerQuery } from "../api/retailer-queries";
import { RetailerOverviewTab } from "./RetailerOverviewTab";
import { RetailerOrdersTab } from "./RetailerOrdersTab";
import { RetailerNotesTab } from "./RetailerNotesTab";

interface RetailerDetailPageProps {
  retailerId: string;
}

export function RetailerDetailPage({ retailerId }: RetailerDetailPageProps) {
  const navigate = useNavigate();
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => void navigate({ to: "/retailers" })}
        className="-ml-2"
      >
        <ArrowLeft className="mr-1 size-4" />
        Back to Retailers
      </Button>

      {/* Header */}
      <EntityDetailHeader
        title={retailer.name}
        subtitle={retailer.email || undefined}
        status={retailer.status}
        avatarUrl={retailer.logoUrl ?? undefined}
        avatarFallback={retailer.name.charAt(0).toUpperCase()}
      />

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <RetailerOverviewTab retailer={retailer} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <RetailerOrdersTab retailerId={retailerId} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <RetailerNotesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
