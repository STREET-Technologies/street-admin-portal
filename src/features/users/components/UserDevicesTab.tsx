import { Smartphone } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUserDevicesQuery } from "../api/user-queries";

interface UserDevicesTabProps {
  userId: string;
}

export function UserDevicesTab({ userId }: UserDevicesTabProps) {
  const { data: devices, isLoading, isError, error, refetch } =
    useUserDevicesQuery(userId);

  if (isLoading) {
    return <LoadingState variant="card" rows={3} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load devices"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <EmptyState
        icon={Smartphone}
        title="No devices"
        description="This user has not registered any devices yet."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <Card key={device.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">
              {device.deviceName ?? device.platform ?? "Unknown Device"}
            </CardTitle>
            <StatusBadge
              status={device.isActive ? "active" : "inactive"}
              size="sm"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Platform
              </p>
              <p className="text-sm capitalize">{device.platform}</p>
            </div>
            {device.deviceId && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Device ID
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {device.deviceId}
                </p>
              </div>
            )}
            {device.lastUsedAt && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Last Used
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(device.lastUsedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Registered
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(device.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                FCM Token
              </p>
              <p className="text-xs font-mono text-muted-foreground truncate">
                {device.token.slice(0, 20)}...
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
