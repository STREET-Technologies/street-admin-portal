import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, User, Users, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  useReferralCodeQuery,
  useReferralUsesQuery,
  useToggleReferralCodeMutation,
} from "../api/referral-queries";
import type { BackendReferralUse } from "../types";

interface ReferralDetailPageProps {
  referralId: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReferralDetailPage({ referralId }: ReferralDetailPageProps) {
  const navigate = useNavigate();
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
    <div className="space-y-6">
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
          />
          <StatusBadge status={code.isActive ? "active" : "inactive"} />
        </div>
      </div>

      <Separator />

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Owner
            </CardTitle>
            <User className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {code.ownerId ? (
              <button
                type="button"
                className="text-sm font-medium hover:underline"
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
              <span className="text-sm text-muted-foreground">
                {code.belongsTo || "No owner (promotional)"}
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uses
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{code.totalUses}</p>
            <p className="text-xs text-muted-foreground">
              {code.successfulReferrals} successful
              {code.maxUses != null && ` / ${code.maxUses} max`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Created
            </CardTitle>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{formatDate(code.createdAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expires
            </CardTitle>
            <Hash className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {code.expiresAt ? formatDate(code.expiresAt) : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Uses table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral Uses</CardTitle>
        </CardHeader>
        <CardContent>
          {usesLoading ? (
            <LoadingState variant="table" rows={3} />
          ) : !uses || uses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No uses yet
            </p>
          ) : (
            <div className="rounded-lg border">
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
                      <TableCell className="text-sm">
                        {use.friendDiscountApplied != null
                          ? `\u00A3${Number(use.friendDiscountApplied).toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {use.referrerRewardEarned != null
                          ? `\u00A3${Number(use.referrerRewardEarned).toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(use.usedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(use.completedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
