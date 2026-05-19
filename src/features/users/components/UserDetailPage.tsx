import { BackButton } from "@/components/shared/BackButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@/components/shared/UnderlineTabs";
import { EntityDetailHeader } from "@/components/shared/EntityDetailHeader";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useUserQuery } from "../api/user-queries";
import { useTabParam } from "@/hooks/use-tab-param";
import { formatDate } from "@/lib/format-utils";
import { UserOverviewTab } from "./UserOverviewTab";
import { UserOrdersTab } from "./UserOrdersTab";
import { UserAddressesTab } from "./UserAddressesTab";
import { UserDevicesTab } from "./UserDevicesTab";
import { UserNotesTab } from "./UserNotesTab";
import { UserActivityTab } from "./UserActivityTab";
import { UserReferralTab } from "./UserReferralTab";

interface UserDetailPageProps {
  userId: string;
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const { data: user, isLoading, isError, error, refetch } = useUserQuery(userId);
  const [activeTab, setActiveTab] = useTabParam("overview");

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
      <BackButton to="/users" label="Users" />

      {/* Header */}
      <EntityDetailHeader
        title={user.name}
        status={user.status}
        avatarUrl={user.avatarUrl ?? undefined}
        avatarFallback={initials}
      />

      {/* Created / updated — small meta row matching the retailer pattern.
          Email lives in the Customer info card so it's not duplicated here. */}
      <div className="flex gap-6 text-xs text-muted-foreground">
        <span className="inline-flex gap-1.5">
          <span className="font-medium uppercase tracking-wider">Created</span>
          <span className="tabular-nums text-foreground/80">
            {formatDate(user.createdAt)}
          </span>
        </span>
        <span className="inline-flex gap-1.5">
          <span className="font-medium uppercase tracking-wider">
            Last updated
          </span>
          <span className="tabular-nums text-foreground/80">
            {formatDate(user.updatedAt)}
          </span>
        </span>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <UnderlineTabsList>
          <UnderlineTabsTrigger value="overview">Overview</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="orders">Orders</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="addresses">Addresses</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="devices">Devices</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="referral">Referral</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="notes">Notes</UnderlineTabsTrigger>
          <UnderlineTabsTrigger value="activity">Activity</UnderlineTabsTrigger>
        </UnderlineTabsList>

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

        <TabsContent value="referral" className="mt-6">
          <UserReferralTab userId={userId} userName={user.name} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <UserNotesTab userId={userId} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <UserActivityTab userId={userId} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
