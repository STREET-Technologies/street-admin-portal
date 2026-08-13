import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { skipToken, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LABEL_RESOLVERS } from "./breadcrumb-labels";

/** Map URL segments to display labels. */
const segmentLabels: Record<string, string> = {
  users: "Users",
  retailers: "Retailers",
  orders: "Orders",
  referrals: "Referral Codes",
  settings: "Settings",
};

function formatSegment(segment: string): string {
  return (
    segmentLabels[segment] ??
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Resolve a human-readable label for an ID segment from the query cache.
 *
 * Subscribes via useQuery rather than reading queryClient.getQueryData: that
 * is a one-shot snapshot taken during render, so on a first visit — when the
 * detail query is still in flight and the cache is empty — the crumb fell back
 * to the raw UUID and never re-rendered once the data landed. It only looked
 * correct on a second visit because the cache was warm by then.
 *
 * queryFn is skipToken, so this never fetches: the detail page owns fetching,
 * this only observes whatever it puts in the cache.
 */
function useResolvedLabel(segment: string, prevSegment: string | undefined): string {
  const resolver = prevSegment ? LABEL_RESOLVERS[prevSegment] : undefined;

  const { data } = useQuery({
    queryKey: resolver?.queryKey(segment) ?? ["breadcrumb", "unresolved", segment],
    queryFn: skipToken,
    staleTime: Infinity,
  });

  if (resolver && data !== undefined) {
    const label = resolver.toLabel(data as never);
    if (label) return label;
  }

  return formatSegment(segment);
}

export function Breadcrumbs() {
  const location = useLocation();

  const segments = location.pathname
    .split("/")
    .filter((s) => s !== "" && !s.startsWith("_"));

  if (segments.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPageLabel
                    segment={segment}
                    prevSegment={segments[index - 1]}
                  />
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{formatSegment(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Separate component so the hook runs per-segment without violating hook rules. */
function BreadcrumbPageLabel({
  segment,
  prevSegment,
}: {
  segment: string;
  prevSegment: string | undefined;
}) {
  const label = useResolvedLabel(segment, prevSegment);
  return <BreadcrumbPage>{label}</BreadcrumbPage>;
}
