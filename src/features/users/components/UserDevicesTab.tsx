import { Smartphone } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format-utils";
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
        <div key={device.id} className="rounded-md border bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {device.deviceName ?? device.platform ?? "Unknown Device"}
            </h3>
            <StatusBadge
              status={device.isActive ? "active" : "inactive"}
              size="sm"
            />
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Platform
              </p>
              <p className="text-sm capitalize">{device.platform}</p>
            </div>
            {device.deviceId && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Device ID
                </p>
                <p className="text-sm font-mono text-muted-foreground">
                  {device.deviceId}
                </p>
              </div>
            )}
            {device.lastUsedAt && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last used
                </p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {formatDate(device.lastUsedAt)}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Registered
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {formatDate(device.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                FCM token
              </p>
              <p className="text-xs font-mono text-muted-foreground truncate">
                {device.token.slice(0, 20)}...
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
