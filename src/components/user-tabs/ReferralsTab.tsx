import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Users, TrendingUp, DollarSign, Calendar, Check, X } from "lucide-react";
import { ApiService } from "@/services/api";
import type { ReferralCodeStatus } from "@/types";

interface ReferralData {
  id: string;
  code: string;
  codeType: string;
  friendRewardValue: number;
  referrerRewardValue: number;
  minimumOrderAmount: number;
  totalUses: number;
  maxUses?: number;
  successfulReferrals: number;
  totalRewardsEarned: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  status: ReferralCodeStatus;
}

interface ReferralsTabProps {
  userId: string;
}

export function ReferralsTab({ userId }: ReferralsTabProps) {
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [hasCode, setHasCode] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/v1/referrals/admin/users/${userId}/code`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasCode(data.hasCode);
        if (data.hasCode) {
          setReferralData(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ReferralCodeStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "maxed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "disabled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Referral Code
          </CardTitle>
          <CardDescription>
            This user has not generated a referral code yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>The user will get a referral code when they access the referral feature in the app</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Referral Code
            </CardTitle>
            <Badge className={getStatusColor(referralData!.status)}>
              {referralData!.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Display */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 text-center">
            <div className="text-sm text-muted-foreground mb-2">Referral Code</div>
            <div className="text-4xl font-bold tracking-wider text-primary mb-2">
              {referralData!.code}
            </div>
            <div className="text-xs text-muted-foreground">
              Created {new Date(referralData!.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Reward Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Friend Reward</div>
              <div className="text-2xl font-bold text-green-600">
                £{referralData!.friendRewardValue.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Referrer Reward</div>
              <div className="text-2xl font-bold text-blue-600">
                £{referralData!.referrerRewardValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Minimum Order</div>
            <div className="font-semibold">£{referralData!.minimumOrderAmount.toFixed(2)}</div>
          </div>

          {referralData!.maxUses && (
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Max Uses</div>
              <div className="font-semibold">{referralData!.maxUses}</div>
            </div>
          )}

          {referralData!.expiresAt && (
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Expires</div>
              <div className="font-semibold">{new Date(referralData!.expiresAt).toLocaleDateString()}</div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Status</div>
            <div className="flex items-center gap-2">
              {referralData!.isActive ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-semibold">Active</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 font-semibold">Inactive</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Uses</div>
                <div className="text-2xl font-bold">
                  {referralData!.totalUses}
                  {referralData!.maxUses && <span className="text-sm text-muted-foreground"> / {referralData!.maxUses}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Successful Referrals</div>
                <div className="text-2xl font-bold">{referralData!.successfulReferrals}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
                <div className="text-2xl font-bold">£{referralData!.totalRewardsEarned.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future: Referral History Table */}
      {/* Can add a table here showing who used their code */}
    </div>
  );
}
