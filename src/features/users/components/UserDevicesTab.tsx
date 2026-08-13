import { ChevronRight, Monitor, Smartphone } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { formatDate, formatDateTime } from "@/lib/format-utils";
import { useUserDevicesQuery } from "../api/user-queries";
import { groupDevices, readAppVersion, type DeviceGroup } from "../devices";

/**
 * Push devices for one customer (TT-452).
 *
 * The endpoint returns every registration ever made, not just the live one,
 * because the live set answers almost nothing support asks: did they
 * reinstall, when did push last work, is anything receiving at all. Rows are
 * grouped into devices by `devices.ts` — see the caveats documented there
 * before trusting the device count.
 *
 * Presented as a list rather than cards: a customer can have a dozen
 * registrations, and cards turn that into a wall of boxes with the one row
 * that matters buried somewhere inside it.
 */
export function UserDevicesTab({ userId }: { userId: string }) {
  const {
    data: devices,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserDevicesQuery(userId);

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
        description="This user has never registered the app for push notifications."
      />
    );
  }

  const groups = groupDevices(devices);
  const liveCount = groups.filter((g) => g.isActive).length;

  return (
    <div className="space-y-4">
      {/* Both numbers, always. The device count alone invites the question
          "why does it say 1 when there are 12 rows?", and the registration
          count alone is the number that used to read as a device count. */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span className="font-medium">
          <span className="tabular-nums">{groups.length}</span>{" "}
          {groups.length === 1 ? "device" : "devices"}
        </span>
        <span className="text-muted-foreground">
          · <span className="tabular-nums">{devices.length}</span>{" "}
          {devices.length === 1 ? "registration" : "registrations"} ·{" "}
          <span className="tabular-nums">{liveCount}</span> receiving push
        </span>
      </div>

      <div className="divide-y rounded-md border">
        {groups.map((group) => (
          <DeviceRow key={group.key} group={group} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        A registration is written every time the app requests a push token — on
        reinstall, sign-in, or token refresh. Repeat registrations of the same
        device are grouped together.
      </p>
    </div>
  );
}

function DeviceRow({ group }: { group: DeviceGroup }) {
  const Icon = group.platform === "web" ? Monitor : Smartphone;
  const count = group.registrations.length;

  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="group/device flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium">{group.name}</span>
            <StatusBadge
              status={group.isActive ? "active" : "inactive"}
              size="sm"
            />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="capitalize">{group.platform}</span>
            {group.appVersion && <> · v{group.appVersion}</>}
            {group.lastSeenAt && <> · Last seen {formatDate(group.lastSeenAt)}</>}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {count} {count === 1 ? "registration" : "registrations"}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/device:rotate-90" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t bg-muted/30 px-4 py-3">
          {group.deviceId && (
            <p className="mb-3 text-xs text-muted-foreground">
              Device ID{" "}
              <span className="font-mono break-all">{group.deviceId}</span> ·
              First registered {formatDate(group.firstSeenAt)}
            </p>
          )}
          <ul className="space-y-2">
            {group.registrations.map((reg) => {
              const version = readAppVersion(reg.metadata);
              return (
                <li
                  key={reg.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                >
                  <span
                    className={
                      reg.isActive
                        ? "font-medium"
                        : "text-muted-foreground line-through"
                    }
                  >
                    {reg.isActive ? "Active" : "Superseded"}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    Registered {formatDateTime(reg.createdAt)}
                  </span>
                  {reg.lastUsedAt && (
                    <span className="text-muted-foreground tabular-nums">
                      Last used {formatDateTime(reg.lastUsedAt)}
                    </span>
                  )}
                  {version && (
                    <span className="text-muted-foreground">v{version}</span>
                  )}
                  <span className="ml-auto flex items-center gap-1">
                    <span className="font-mono text-muted-foreground">
                      {reg.token.slice(0, 12)}…
                    </span>
                    <CopyButton value={reg.token} label="Copy FCM token" />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
