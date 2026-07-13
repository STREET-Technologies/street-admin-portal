import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useDashboardStatsQuery } from "../api/dashboard-queries";
import type { DashboardStats } from "../api/dashboard-api";

/**
 * Platform overview (TT-358). Stat tiles + a needs-attention rail that
 * deep-links into the pre-filtered orders tabs. Numbers refresh every 60s.
 *
 * Styling follows the portal's flat tile pattern (bordered grid, hairline
 * dividers, muted labels, tabular numerals) — status color appears only on
 * the attention rail, always paired with an icon and label.
 */

function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function DashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStatsQuery();

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Platform overview" />
        <ErrorState
          title="Failed to load dashboard"
          message="There was a problem fetching platform stats. Please try again."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Platform overview" />

      {/* Orders + GMV */}
      <section>
        <h2 className="text-base font-semibold leading-none">Orders</h2>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
          <Stat label="Orders today" value={stats?.orders.today} isLoading={isLoading} />
          <Stat
            label="GMV today"
            value={stats ? formatGBP(stats.orders.gmvTodayGbp) : undefined}
            isLoading={isLoading}
          />
          <Stat label="Orders · 7 days" value={stats?.orders.week} isLoading={isLoading} />
          <Stat
            label="GMV · 7 days"
            value={stats ? formatGBP(stats.orders.gmvWeekGbp) : undefined}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Needs attention */}
      <section>
        <h2 className="text-base font-semibold leading-none">Needs attention</h2>
        <div className="mt-4 space-y-2 border-t pt-5">
          {isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <AttentionRail stats={stats!} />
          )}
        </div>
      </section>

      {/* Platform */}
      <section>
        <h2 className="text-base font-semibold leading-none">Platform</h2>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
          <Stat
            label="Retailers live"
            value={stats ? `${stats.vendors.active}/${stats.vendors.total}` : undefined}
            hint={
              stats && stats.vendors.offline > 0
                ? `${stats.vendors.offline} offline`
                : undefined
            }
            isLoading={isLoading}
          />
          <Stat
            label="Deactivated / uninstalled"
            value={
              stats
                ? `${stats.vendors.deactivated} / ${stats.vendors.uninstalled}`
                : undefined
            }
            isLoading={isLoading}
          />
          <Stat label="Customers" value={stats?.users.total} isLoading={isLoading} />
          <Stat
            label="New this week"
            value={stats?.users.newThisWeek}
            isLoading={isLoading}
          />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Needs-attention rail
// ---------------------------------------------------------------------------

function AttentionRail({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      count: stats.orders.stuck,
      label: "stuck deliveries",
      description: "reconciliation gave up — resolve manually",
      tab: "stuck",
      icon: AlertTriangle,
      tone: "critical" as const,
    },
    {
      count: stats.orders.awaitingAcceptance,
      label: "awaiting acceptance",
      description: "waiting on the retailer",
      tab: "new",
      icon: Clock,
      tone: "warning" as const,
    },
    {
      count: stats.orders.pendingReturns,
      label: "returns in progress",
      description: "opened or on the way back to the store",
      tab: "returned",
      icon: RotateCcw,
      tone: "warning" as const,
    },
  ].filter((item) => item.count > 0);

  if (items.length === 0) {
    return (
      <p className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-green-600" />
        All clear — nothing needs attention right now.
      </p>
    );
  }

  return (
    <>
      {items.map((item) => (
        <Link
          key={item.label}
          to="/orders"
          search={{ tab: item.tab }}
          className={`flex items-center gap-3 rounded-md border px-4 py-3 transition-colors hover:bg-muted/50 ${
            item.tone === "critical"
              ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              : "border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
          }`}
        >
          <item.icon
            className={`size-4 shrink-0 ${
              item.tone === "critical" ? "text-red-600" : "text-amber-600"
            }`}
          />
          <span className="text-sm">
            <span className="font-semibold tabular-nums">{item.count}</span>{" "}
            {item.label}
            <span className="text-muted-foreground"> — {item.description}</span>
          </span>
          <ArrowRight className="ml-auto size-4 text-muted-foreground" />
        </Link>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Stat tile — same flat pattern as the user overview stats strip
// ---------------------------------------------------------------------------

function Stat({
  label,
  value,
  hint,
  isLoading,
}: {
  label: string;
  value: string | number | undefined;
  hint?: string;
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
      {!isLoading && hint && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
