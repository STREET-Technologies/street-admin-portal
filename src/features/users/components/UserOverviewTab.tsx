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
import type { UserViewModel } from "../types";

interface UserOverviewTabProps {
  user: UserViewModel;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const updateUser = useUpdateUserMutation(user.id);
  const { data: stats, isLoading: statsLoading } = useUserStatsQuery(user.id);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={statsLoading ? undefined : String(stats?.totalOrders ?? 0)}
          isLoading={statsLoading}
        />
        <StatCard
          label="Total Spent"
          value={statsLoading ? undefined : formatGBP(stats?.totalSpent ?? "0")}
          isLoading={statsLoading}
        />
        <StatCard
          label="First Order"
          value={statsLoading ? undefined : formatShortDate(stats?.firstOrderDate ?? null)}
          isLoading={statsLoading}
        />
        <StatCard
          label="Last Order"
          value={statsLoading ? undefined : formatShortDate(stats?.lastOrderDate ?? null)}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EditableField
              label="Email"
              value={user.email}
              onSave={async (val) => {
                await updateUser.mutateAsync({ email: val });
              }}
            />
            <EditableField
              label="Phone"
              value={user.phone}
              onSave={async (val) => {
                await updateUser.mutateAsync({ phone: val });
              }}
            />
            {user.language && (
              <EditableField
                label="Language"
                value={user.language}
                onSave={async (val) => {
                  await updateUser.mutateAsync({ language: val });
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CopyableField label="User ID" value={user.id} mono />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Role</p>
              <p className="text-sm capitalize">{user.role}</p>
            </div>
            {user.ssoProvider && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  SSO Provider
                </p>
                <p className="text-sm capitalize">{user.ssoProvider}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm">{formatDate(user.updatedAt)}</p>
            </div>
            <div className="flex gap-2">
              {user.isTestAccount && (
                <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                  Test Account
                </Badge>
              )}
              {user.isAnonymized && (
                <Badge variant="outline" className="text-gray-500 border-gray-300 dark:text-gray-400 dark:border-gray-600">
                  Anonymized
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
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
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-20" />
        ) : (
          <p className="mt-1 text-lg font-semibold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}
