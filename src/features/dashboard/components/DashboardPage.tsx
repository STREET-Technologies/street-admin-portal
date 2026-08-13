import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CreditCard,
  ChevronRight,
  MapPin,
  RotateCcw,
  Store,
  UserRound,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { useDashboardStatsQuery } from "../api/dashboard-queries";
import type { DashboardStats } from "../api/dashboard-api";

/**
 * Platform overview (TT-358). Stat tiles + a needs-attention rail that
 * deep-links into the pre-filtered orders tabs. Numbers refresh every 60s.
 *
 * Styling follows the portal's flat tile pattern (bordered grid, hairline
 * dividers, muted labels, tabular numerals).
 *
 * Colour rule: emphasis marks URGENCY, never which table a row came from.
 * Everything under "Needs attention" needs attention — the heading already
 * says so, and tinting most of it just restates that while making the panel
 * shout. Only a stuck delivery keeps an accent, because a customer is
 * actively waiting on it; every other fault is latent and reads in the
 * neutral card. Category is carried by the icon and the wording, so nothing
 * here depends on telling two colours apart.
 */

function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function DashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStatsQuery();
  const attentionItems = getAttentionItems(stats);
  const faultGroups = getFaultGroups(stats);
  // Every channel counts toward showing the section — an un-geocoded outlet
  // with no order problems is still something to act on.
  const hasAttention = attentionItems.length > 0 || faultGroups.length > 0;

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

      {/* Needs attention — first, and only when there is something.
          Nothing to act on means no heading, no border, no "all clear" line
          taking up the middle of the page: the section's presence IS the
          signal, so a quiet dashboard is genuinely quiet. */}
      {!isLoading && hasAttention && (
        <section>
          <h2 className="text-base font-semibold leading-none">
            Needs attention
          </h2>
          <div className="mt-4 space-y-2 border-t pt-5">
            <AttentionRail items={attentionItems} />

            {/* Grouped by fault, not by record: two retailers failing the
                same address check are one problem to work through, not two
                unrelated lines. The header carries the count so the panel
                stays scannable without expanding anything. */}
            {faultGroups.map((group) => (
              <FaultGroup key={group.title} group={group} />
            ))}
          </div>
        </section>
      )}

      {/* Orders + GMV */}
      <section>
        <h2 className="text-base font-semibold leading-none">Orders</h2>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
          <Stat
            label="Orders today"
            value={stats?.orders.today}
            isLoading={isLoading}
          />
          <Stat
            label="GMV today"
            value={stats ? formatGBP(stats.orders.gmvTodayGbp) : undefined}
            isLoading={isLoading}
          />
          <Stat
            label="Orders · 7 days"
            value={stats?.orders.week}
            isLoading={isLoading}
          />
          <Stat
            label="GMV · 7 days"
            value={stats ? formatGBP(stats.orders.gmvWeekGbp) : undefined}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Platform */}
      <section>
        <h2 className="text-base font-semibold leading-none">Platform</h2>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border lg:grid-cols-4">
          <Stat
            label="Retailers live"
            value={
              stats
                ? `${stats.vendors.active}/${stats.vendors.total}`
                : undefined
            }
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
          <Stat
            label="Customers"
            value={stats?.users.total}
            isLoading={isLoading}
          />
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

interface AttentionItem {
  count: number;
  label: string;
  description: string;
  /** Orders-list query that shows exactly these rows. */
  search: { tab?: string; billingStatus?: string };
  icon: React.ElementType;
  tone: "critical" | "warning";
}

/** One record inside a fault group, with where to go and fix it. */
interface FaultEntry {
  id: string;
  /** Who it belongs to — the retailer or the customer. */
  owner: string;
  /** Which record of theirs — the branch, or the postcode. */
  detail: string | null;
  link:
    | { kind: "retailer"; retailerId: string }
    | { kind: "user"; userId: string };
}

interface FaultGroupData {
  title: string;
  consequence: string;
  /** Distinct per category — the icon, not colour, says which fault it is. */
  icon: React.ElementType;
  entries: FaultEntry[];
}

/**
 * Faults grouped by what is wrong rather than by which record has it.
 * Two retailers failing the same postcode check are one job to work through;
 * listing them as unrelated rows made the panel longer without making it
 * clearer.
 */
function getFaultGroups(stats: DashboardStats | undefined): FaultGroupData[] {
  if (!stats) return [];

  const outletsBy = (reason: "no_coordinates" | "address_unbookable") =>
    stats.attention.outlets
      .filter((o) => o.reason === reason)
      .map((o) => ({
        id: o.outletId,
        owner: o.vendorName,
        detail: o.outletName,
        link: { kind: "retailer" as const, retailerId: o.vendorId },
      }));

  const groups: FaultGroupData[] = [
    {
      title: "Retailer address not courier-bookable",
      consequence: "Stuart will refuse to book collections from these branches",
      icon: Store,
      entries: outletsBy("address_unbookable"),
    },
    {
      title: "Geo location missing",
      consequence: "these branches are invisible in customer discovery",
      icon: MapPin,
      entries: outletsBy("no_coordinates"),
    },
    {
      title: "Customer address not courier-bookable",
      consequence: "deliveries to these customers will fail",
      icon: UserRound,
      entries: stats.attention.userAddresses.map((a) => ({
        id: a.addressId,
        owner: a.customerName,
        detail: a.postcode,
        link: { kind: "user" as const, userId: a.userId },
      })),
    },
  ];

  return groups.filter((group) => group.entries.length > 0);
}

/**
 * The things a support person can act on right now, each one already
 * non-zero. Returns an empty array when the platform is quiet, which is what
 * removes the whole section from the dashboard.
 */
function getAttentionItems(stats: DashboardStats | undefined): AttentionItem[] {
  if (!stats) return [];
  const items: AttentionItem[] = [
    {
      count: stats.orders.stuck,
      label: "stuck deliveries",
      description: "reconciliation gave up — resolve manually",
      search: { tab: "stuck" },
      icon: AlertTriangle,
      tone: "critical",
    },
    {
      count: stats.orders.awaitingAcceptance,
      label: "awaiting acceptance",
      description: "waiting on the retailer",
      search: { tab: "new" },
      icon: Clock,
      tone: "warning",
    },
    {
      count: stats.orders.pendingReturns,
      label: "returns in progress",
      description: "opened or on the way back to the store",
      search: { tab: "returned" },
      icon: RotateCcw,
      tone: "warning",
    },
    {
      count: stats.attention.failedBilling,
      label: "failed charges",
      description: "Shopify rejected the commission charge",
      search: { billingStatus: "failed" },
      icon: CreditCard,
      tone: "warning",
    },
  ];
  return items.filter((item) => item.count > 0);
}

/**
 * A fault and the records carrying it.
 *
 * Open by default up to a handful of entries: this section only renders when
 * something is wrong, so hiding the detail behind a click would undo the
 * point of surfacing it. Longer lists start collapsed so one noisy fault
 * cannot bury the others.
 */
function FaultGroup({ group }: { group: FaultGroupData }) {
  return (
    <Collapsible
      defaultOpen={false}
      className="rounded-md border border-border bg-muted/40"
    >
      <CollapsibleTrigger className="group/fault flex w-full items-center gap-3 px-4 py-3 text-left">
        <group.icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm">
          <span className="font-semibold tabular-nums">
            {group.entries.length}
          </span>{" "}
          {group.title}
          <span className="text-muted-foreground"> — {group.consequence}</span>
        </span>
        <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/fault:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="border-t">
          {group.entries.map((entry) => (
            <li key={entry.id}>
              {entry.link.kind === "retailer" ? (
                <Link
                  to="/retailers/$retailerId"
                  params={{ retailerId: entry.link.retailerId }}
                  search={{ tab: "outlets" }}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted/60"
                >
                  <span className="font-medium">{entry.owner}</span>
                  {entry.detail && (
                    <span className="text-muted-foreground">
                      · {entry.detail}
                    </span>
                  )}
                  <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
                </Link>
              ) : (
                <Link
                  to="/users/$userId"
                  params={{ userId: entry.link.userId }}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted/60"
                >
                  <span className="font-medium">{entry.owner}</span>
                  {entry.detail && (
                    <span className="text-muted-foreground">
                      · {entry.detail}
                    </span>
                  )}
                  <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AttentionRail({ items }: { items: AttentionItem[] }) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.label}
          to="/orders"
          search={item.search}
          className={`flex items-center gap-3 rounded-md border px-4 py-3 transition-colors hover:bg-muted/50 ${
            item.tone === "critical"
              ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              : "border-border bg-muted/40"
          }`}
        >
          <item.icon
            className={`size-4 shrink-0 ${
              item.tone === "critical"
                ? "text-red-600"
                : "text-muted-foreground"
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
