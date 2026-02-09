import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

/**
 * Dynamic breadcrumb trail based on the current URL path.
 * Shows "Home" as root, then each path segment as a link,
 * with the last segment as plain text (current page).
 *
 * Only renders if there are path segments beyond the root.
 */
export function Breadcrumbs() {
  const location = useLocation();

  // Split path into segments, filter out empty strings and layout prefixes
  const segments = location.pathname
    .split("/")
    .filter((s) => s !== "" && !s.startsWith("_"));

  // Don't show breadcrumbs on root/home page
  if (segments.length === 0) {
    return null;
  }

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
                  <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
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
