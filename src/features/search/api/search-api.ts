import { getUsers } from "@/features/users/api/user-api";
import { getRetailers } from "@/features/retailers/api/retailer-api";
import { toUserViewModel } from "@/features/users/types";
import { toRetailerViewModel } from "@/features/retailers/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResultItem {
  id: string;
  type: "user" | "retailer" | "order";
  title: string;
  subtitle: string;
  avatarUrl?: string;
  status?: string;
  href: string;
}

export interface SearchResults {
  users: SearchResultItem[];
  retailers: SearchResultItem[];
  orders: SearchResultItem[];
}

// ---------------------------------------------------------------------------
// Order ID pattern detection
// ---------------------------------------------------------------------------

const ORDER_ID_PATTERN = /^ST-\d+$/i;

/**
 * Detect if a query looks like an order ID (ST-XXXXX format).
 * Returns a synthetic search result item that links directly to the order.
 */
function detectOrderId(query: string): SearchResultItem[] {
  if (!ORDER_ID_PATTERN.test(query)) return [];

  const orderId = query.toUpperCase();
  return [
    {
      id: orderId,
      type: "order",
      title: orderId,
      subtitle: "Go to order",
      href: `/orders/${orderId}`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Global search aggregator
// ---------------------------------------------------------------------------

/**
 * Aggregates results from user and vendor search endpoints in parallel.
 * Also checks for order ID pattern matches (client-side).
 *
 * Each endpoint is called via Promise.allSettled so a single failure
 * does not block the entire search.
 */
export async function globalSearch(query: string): Promise<SearchResults> {
  const [usersResponse, vendorsResponse] = await Promise.allSettled([
    getUsers({ search: query, page: 1, limit: 5 }),
    getRetailers({ name: query, page: 1, limit: 5 }),
  ]);

  // Transform user results
  const users: SearchResultItem[] =
    usersResponse.status === "fulfilled"
      ? usersResponse.value.data.map((backendUser) => {
          const vm = toUserViewModel(backendUser);
          return {
            id: vm.id,
            type: "user" as const,
            title: vm.name,
            subtitle: vm.email,
            avatarUrl: vm.avatarUrl ?? undefined,
            status: vm.status,
            href: `/users/${vm.id}`,
          };
        })
      : [];

  // Transform retailer results
  const retailers: SearchResultItem[] =
    vendorsResponse.status === "fulfilled"
      ? vendorsResponse.value.data.map((backendVendor) => {
          const vm = toRetailerViewModel(backendVendor);
          return {
            id: vm.id,
            type: "retailer" as const,
            title: vm.name,
            subtitle: vm.category,
            avatarUrl: undefined,
            status: vm.status,
            href: `/retailers/${vm.id}`,
          };
        })
      : [];

  // Client-side order ID detection
  const orders = detectOrderId(query);

  return { users, retailers, orders };
}
