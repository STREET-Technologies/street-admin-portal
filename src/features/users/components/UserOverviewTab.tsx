import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total orders"
          value={statsLoading ? undefined : String(stats?.totalOrders ?? 0)}
          isLoading={statsLoading}
        />
        <StatCard
          label="Total spent"
          value={statsLoading ? undefined : formatGBP(stats?.totalSpent ?? "0")}
          isLoading={statsLoading}
        />
        <StatCard
          label="First order"
          value={
            statsLoading ? undefined : formatShortDate(stats?.firstOrderDate ?? null)
          }
          isLoading={statsLoading}
        />
        <StatCard
          label="Last order"
          value={
            statsLoading ? undefined : formatShortDate(stats?.lastOrderDate ?? null)
          }
          isLoading={statsLoading}
        />
      </div>

      {/* Customer info — single card consolidating contact + account fields */}
      <Card>
        <CardHeader>
          <CardTitle>Customer info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <Badge
                  variant="outline"
                  className="border-amber-300 text-amber-700"
                >
                  Test account
                </Badge>
              )}
              {user.isAnonymized && (
                <Badge
                  variant="outline"
                  className="border-gray-300 text-gray-500"
                >
                  Anonymized
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | undefined;
  isLoading: boolean;
}) {
  return (
    <Card className="py-3 gap-1">
      <CardContent className="px-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-20" />
        ) : (
          <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
