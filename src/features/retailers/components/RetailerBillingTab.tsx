import { CreditCard, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatCurrency } from "@/lib/format-utils";
import { useRetailerBillingQuery } from "../api/retailer-queries";

interface RetailerBillingTabProps {
  retailerId: string;
}

function SubscriptionStatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="secondary">Unknown</Badge>;
  const upper = status.toUpperCase();
  if (upper === "ACTIVE") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
  if (upper === "CANCELLED") return <Badge variant="destructive">Cancelled</Badge>;
  if (upper === "PENDING") return <Badge variant="secondary">Pending</Badge>;
  if (upper === "DECLINED") return <Badge variant="destructive">Declined</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  highlight?: "warn" | "danger";
}) {
  const iconClass =
    highlight === "danger"
      ? "text-red-500"
      : highlight === "warn"
        ? "text-yellow-500"
        : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <Icon className={`size-5 shrink-0 ${iconClass}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function RetailerBillingTab({ retailerId }: RetailerBillingTabProps) {
  const { data, isLoading, isError, refetch } = useRetailerBillingQuery(retailerId);

  if (isLoading) return <LoadingState variant="page" />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load billing data"
        message="There was a problem fetching billing information for this retailer."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data) return null;

  const capPercent =
    data.subscription && data.subscription.cappedAmount > 0
      ? Math.min(
          100,
          ((data.orders.chargedAmount / data.subscription.cappedAmount) * 100),
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Shopify subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-4" />
            Shopify Billing Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.subscription ? (
            <p className="text-sm text-muted-foreground">
              {data.shopDomain
                ? "Could not retrieve subscription data from Shopify app — it may be offline."
                : "This retailer has no Shopify shop linked."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <SubscriptionStatusBadge status={data.subscription.status} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Shop domain</p>
                <p className="text-sm font-medium">{data.shopDomain ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Spending cap</p>
                <p className="text-sm font-medium">
                  {formatCurrency(data.subscription.cappedAmount, data.subscription.billingCurrency)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="text-sm font-medium">{data.subscription.billingCurrency ?? "—"}</p>
              </div>
              {capPercent !== null && (
                <div className="col-span-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cap consumed ({formatCurrency(data.orders.chargedAmount, data.subscription!.billingCurrency)} of {formatCurrency(data.subscription!.cappedAmount, data.subscription!.billingCurrency)})</span>
                    <span>{capPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capPercent >= 90
                          ? "bg-red-500"
                          : capPercent >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${capPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order billing stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Billing Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={CheckCircle} label="Charged" value={data.orders.charged} />
            <StatCard icon={Clock} label="Pending" value={data.orders.pending} highlight={data.orders.pending > 0 ? "warn" : undefined} />
            <StatCard icon={XCircle} label="Failed" value={data.orders.failed} highlight={data.orders.failed > 0 ? "danger" : undefined} />
            <StatCard icon={AlertTriangle} label="Skipped" value={data.orders.skipped} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
