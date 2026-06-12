import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatDate, formatDateTime } from "@/lib/format-utils";
import {
  useReferralCodeQuery,
  useReferralUsesQuery,
  useToggleReferralCodeMutation,
} from "../api/referral-queries";
import type { BackendReferralUse } from "../types";

interface ReferralDetailPageProps {
  referralId: string;
}

export function ReferralDetailPage({ referralId }: ReferralDetailPageProps) {
  const navigate = useNavigate();
  const { canWrite } = useAdminRole();
  const {
    data: code,
    isLoading,
    isError,
    error,
    refetch,
  } = useReferralCodeQuery(referralId);
  const { data: uses, isLoading: usesLoading } =
    useReferralUsesQuery(referralId);
  const toggleMutation = useToggleReferralCodeMutation();

  if (isLoading) {
    return <LoadingState variant="page" />;
  }

  if (isError || !code) {
    return (
      <ErrorState
        title="Failed to load referral code"
        message={
          error instanceof Error ? error.message : "Referral code not found"
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => void navigate({ to: "/referrals" })}
      >
        <ArrowLeft className="mr-1 size-4" />
        Referral Codes
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            {code.code}
          </h1>
          <CopyButton value={code.code} label="Copy code" />
          <Badge variant={code.type === "Promotional" ? "default" : "secondary"}>
            {code.type}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={code.isActive}
            onCheckedChange={(checked) =>
              toggleMutation.mutate({ id: code.id, isActive: checked })
            }
            disabled={!canWrite}
          />
          <StatusBadge status={code.isActive ? "active" : "inactive"} />
        </div>
      </div>

      {/* Key facts — hairline-divided strip, no per-tile shadow */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-4">
        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Owner
          </p>
          {code.ownerId ? (
            <button
              type="button"
              className="mt-0.5 text-sm font-medium hover:underline"
              onClick={() =>
                void navigate({
                  to: "/users/$userId",
                  params: { userId: code.ownerId! },
                })
              }
            >
              {code.ownerName}
            </button>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {code.belongsTo || "No owner (promotional)"}
            </p>
          )}
        </div>

        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Uses
          </p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums">
            {code.totalUses}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {code.successfulReferrals} successful
            {code.maxUses != null && ` / ${code.maxUses} max`}
          </p>
        </div>

        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Created
          </p>
          <p className="mt-0.5 text-sm font-medium tabular-nums">
            {formatDate(code.createdAt)}
          </p>
        </div>

        <div className="bg-card px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Expires
          </p>
          <p className="mt-0.5 text-sm font-medium tabular-nums">
            {code.expiresAt ? formatDate(code.expiresAt) : "Never"}
          </p>
        </div>
      </div>

      {/* Uses table — flat section */}
      <section>
        <h2 className="text-base font-semibold leading-none">Referral uses</h2>
        <div className="mt-4">
          {usesLoading ? (
            <LoadingState variant="table" rows={3} />
          ) : !uses || uses.length === 0 ? (
            <p className="border-t py-8 text-center text-sm text-muted-foreground">
              No uses yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Friend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Friend Discount</TableHead>
                  <TableHead>Referrer Reward</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uses.map((use: BackendReferralUse) => (
                  <TableRow key={use.id}>
                    <TableCell>
                      {use.friendUserId ? (
                        <button
                          type="button"
                          className="text-sm hover:underline"
                          onClick={() =>
                            void navigate({
                              to: "/users/$userId",
                              params: { userId: use.friendUserId! },
                            })
                          }
                        >
                          {use.friendName?.trim() || "Unknown"}
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Unknown
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={use.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {use.friendDiscountApplied != null
                        ? `£${Number(use.friendDiscountApplied).toFixed(2)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {use.referrerRewardEarned != null
                        ? `£${Number(use.referrerRewardEarned).toFixed(2)}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {formatDateTime(use.usedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {formatDateTime(use.completedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
