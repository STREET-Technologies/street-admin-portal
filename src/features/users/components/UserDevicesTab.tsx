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
          <CardHeader>
            <CardTitle className="text-sm">
              {device.model ?? device.platform ?? "Unknown Device"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {device.platform && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Platform
                </p>
                <p className="text-sm capitalize">{device.platform}</p>
              </div>
            )}
            {device.osVersion && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  OS Version
                </p>
                <p className="text-sm">{device.osVersion}</p>
              </div>
            )}
            {device.appVersion && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  App Version
                </p>
                <p className="text-sm">{device.appVersion}</p>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
