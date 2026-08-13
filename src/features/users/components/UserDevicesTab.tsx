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
import {
  groupDevices,
  platformDisplay,
  readAppVersion,
  readOsVersion,
  type DeviceGroup,
} from "../devices";

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

/**
 * One definition of the registration columns, shared by the header and the
 * rows — declaring the widths twice is how a table quietly stops lining up.
 */
const REG_GRID =
  "grid grid-cols-[6.5rem_11rem_11rem_12rem_8rem_minmax(10rem,1fr)] gap-x-4";

function DeviceRow({ group }: { group: DeviceGroup }) {
  const Icon = group.platform === "web" ? Monitor : Smartphone;
  const count = group.registrations.length;

  return (
    <Collapsible defaultOpen={false}>
      {/* Identity only, on one line: which device this is and since when.
          Its OS, app version and last-used date are the Active row of the
          table below, stated more precisely and already lined up in columns —
          repeating them here was the same facts twice in a worse format. */}
      <CollapsibleTrigger className="group/device flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="shrink-0 text-sm font-medium">{group.name}</span>
        <StatusBadge
          status={group.isActive ? "active" : "inactive"}
          size="sm"
          className="shrink-0"
        />
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          {group.deviceId && (
            <>
              <span className="font-mono">{group.deviceId}</span>
              {" · "}
            </>
          )}
          First registered {formatDate(group.firstSeenAt)}
        </span>
        <span className="ml-auto shrink-0 text-sm text-muted-foreground tabular-nums">
          {count} {count === 1 ? "registration" : "registrations"}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/device:rotate-90" />
      </CollapsibleTrigger>

      {/* A real table, not a run of labelled spans. Every row repeated
          "Registered"/"Last used" and nothing lined up, so five registrations
          read as five sentences instead of a ledger you can scan down. */}
      <CollapsibleContent>
        <div className="overflow-x-auto border-t bg-muted/50 px-4 py-3">
          <div className="min-w-[52rem]">
            <div className={`${REG_GRID} pb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground`}>
              <span>State</span>
              <span>Registered</span>
              <span>Last used</span>
              <span>App</span>
              <span>OS</span>
              <span>Token</span>
            </div>
            <div className="divide-y divide-border/60">
              {group.registrations.map((reg) => {
                const version = readAppVersion(reg.metadata);
                // Per-registration, not just the group's: an OS or app upgrade
                // between two registrations is exactly the kind of thing that
                // explains "push stopped working last week".
                const os = readOsVersion(reg.metadata);
                return (
                  <div
                    key={reg.id}
                    className={`${REG_GRID} items-center py-1.5 text-sm`}
                  >
                    <span
                      className={
                        reg.isActive ? "font-medium" : "text-muted-foreground"
                      }
                    >
                      {reg.isActive ? "Active" : "Superseded"}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatDateTime(reg.createdAt)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {reg.lastUsedAt ? formatDateTime(reg.lastUsedAt) : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {version ? `v${version}` : ""}
                    </span>
                    {/* Always the platform, with the version when we have it.
                        The device row no longer names the platform, so a
                        pre-TT-455 row with no metadata must still say whether
                        this was an iPhone or an Android. */}
                    <span className="text-muted-foreground">
                      {platformDisplay(reg.platform, os)}
                    </span>
                    {/* The whole token, clipped by the column rather than by
                        a hard slice — it gets whatever width is spare, and
                        the leading characters are what you compare against a
                        device anyway. */}
                    <span className="flex min-w-0 items-center gap-1">
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {reg.token}
                      </span>
                      <CopyButton
                        value={reg.token}
                        label="Copy FCM token"
                        className="shrink-0"
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
