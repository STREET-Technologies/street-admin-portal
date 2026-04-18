import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { UserViewModel } from "@/features/users/types";
import type { RetailerViewModel } from "@/features/retailers/types";
import type { BackendOrder } from "@/features/orders/types";

/** Map URL segments to display labels. */
const segmentLabels: Record<string, string> = {
  users: "Users",
  retailers: "Retailers",
  couriers: "Couriers",
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

/** Attempt to resolve a human-readable label for an ID segment from the query cache. */
function useResolvedLabel(segment: string, prevSegment: string | undefined): string {
  const queryClient = useQueryClient();

  if (prevSegment === "users") {
    const user = queryClient.getQueryData<UserViewModel>(["users", "detail", segment]);
    if (user?.name) return user.name;
  }

  if (prevSegment === "retailers") {
    const retailer = queryClient.getQueryData<RetailerViewModel>(["retailers", "detail", segment]);
    if (retailer?.name) return retailer.name;
  }

  if (prevSegment === "orders") {
    const order = queryClient.getQueryData<BackendOrder>(["orders", "detail", "byOrderId", segment]);
    if (order?.orderNumber) return order.orderNumber;
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
            <Link to="/users">Home</Link>
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
