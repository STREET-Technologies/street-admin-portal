import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useUserQuery } from "../api/user-queries";
import { UserOverviewTab } from "./UserOverviewTab";
import { UserOrdersTab } from "./UserOrdersTab";
import { UserAddressesTab } from "./UserAddressesTab";
import { UserDevicesTab } from "./UserDevicesTab";
import { UserNotesTab } from "./UserNotesTab";

interface UserDetailPageProps {
  userId: string;
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const navigate = useNavigate();
  const { data: user, isLoading, isError, error, refetch } = useUserQuery(userId);

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isError || !user) {
    return (
      <ErrorState
        title="Failed to load user"
        message={error instanceof Error ? error.message : "User not found"}
        onRetry={() => void refetch()}
      />
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => void navigate({ to: "/users" })}
      >
        <ArrowLeft className="mr-1 size-4" />
        Users
      </Button>

      {/* Header */}
      <EntityDetailHeader
        title={user.name}
        subtitle={user.email !== "No email" ? user.email : undefined}
        status={user.status}
        avatarUrl={user.avatarUrl ?? undefined}
        avatarFallback={initials}
      />

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <UserOverviewTab user={user} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <UserOrdersTab userId={userId} />
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <UserAddressesTab userId={userId} />
        </TabsContent>

        <TabsContent value="devices" className="mt-6">
          <UserDevicesTab userId={userId} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <UserNotesTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
