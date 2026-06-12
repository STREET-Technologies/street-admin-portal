import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyableField } from "@/components/shared/CopyableField";
import { EditableField } from "@/components/shared/EditableField";
import { useUpdateUserMutation, useUserStatsQuery } from "../api/user-queries";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import type { UserViewModel } from "../types";

interface UserOverviewTabProps {
  user: UserViewModel;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatGBP(amount: string): string {
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return "--";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(num);
}

export function UserOverviewTab({ user }: UserOverviewTabProps) {
  const { canWrite } = useAdminRole();
  const updateUser = useUpdateUserMutation(user.id);
  const { data: stats, isLoading: statsLoading } = useUserStatsQuery(user.id);

  const showBadges = user.isTestAccount || user.isAnonymized;

  return (
    <div className="space-y-8">
      {/* Stats strip — one bordered region, hairline-divided cells. No per-tile shadow. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
        <Stat
          label="Total orders"
          value={statsLoading ? undefined : String(stats?.totalOrders ?? 0)}
          isLoading={statsLoading}
        />
        <Stat
          label="Total spent"
          value={statsLoading ? undefined : formatGBP(stats?.totalSpent ?? "0")}
          isLoading={statsLoading}
        />
        <Stat
          label="First order"
          value={statsLoading ? undefined : formatShortDate(stats?.firstOrderDate ?? null)}
          isLoading={statsLoading}
        />
        <Stat
          label="Last order"
          value={statsLoading ? undefined : formatShortDate(stats?.lastOrderDate ?? null)}
          isLoading={statsLoading}
        />
      </div>

      {/* Customer info — flat section: title + divider + fields. Not a lifted card. */}
      <section>
        <h2 className="text-base font-semibold leading-none">Customer info</h2>
        <div className="mt-4 space-y-4 border-t pt-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <EditableField
              label="Email"
              value={user.email}
              onSave={async (val) => {
                await updateUser.mutateAsync({ email: val });
              }}
              disabled={!canWrite}
            />
            <EditableField
              label="Phone"
              value={user.phone}
              onSave={async (val) => {
                await updateUser.mutateAsync({ phone: val });
              }}
              disabled={!canWrite}
            />
            <CopyableField label="User ID" value={user.id} mono />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Role
              </p>
              <p className="text-sm capitalize">{user.role}</p>
            </div>
            {user.ssoProvider && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  SSO provider
                </p>
                <p className="text-sm capitalize">{user.ssoProvider}</p>
              </div>
            )}
          </div>

          {showBadges && (
            <div className="flex gap-2 pt-1">
              {user.isTestAccount && (
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Test account
                </Badge>
              )}
              {user.isAnonymized && (
                <Badge variant="outline" className="border-gray-300 text-gray-500">
                  Anonymized
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="bg-card px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="mt-1.5 h-6 w-20" />
      ) : (
        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      )}
    </div>
  );
}
