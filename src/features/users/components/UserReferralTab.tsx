import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useReferralCodesQuery } from "@/features/referrals/api/referral-queries";

interface UserReferralTabProps {
  userId: string;
  userName: string;
}

export function UserReferralTab({ userId, userName }: UserReferralTabProps) {
  const navigate = useNavigate();

  // Search for codes owned by this user by looking at all user codes
  // and filtering. The backend search matches by name, so use the user's name.
  // Better approach: search by code type = user_generated and check ownerId client-side.
  const { data, isLoading } = useReferralCodesQuery({
    search: userName !== "Unknown" ? userName : undefined,
    limit: 10,
  });

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  // Filter to only this user's codes
  const userCodes = (data?.data ?? []).filter((c) => c.ownerId === userId);

  if (userCodes.length === 0) {
    return (
      <EmptyState
        icon={Ticket}
        title="No referral code"
        description="This user hasn't generated a referral code yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {userCodes.map((code) => (
        <Card key={code.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Referral Code</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                void navigate({
                  to: "/referrals/$referralId",
                  params: { referralId: code.id },
                })
              }
            >
              View details
              <ExternalLink className="ml-1.5 size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Code
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-medium">
                    {code.code}
                  </span>
                  <CopyButton value={code.code} label="Copy code" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <StatusBadge
                  status={code.isActive ? "active" : "inactive"}
                  size="sm"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Uses
                </p>
                <p className="text-sm">{code.totalUses}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Successful
                </p>
                <p className="text-sm">{code.successfulReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
