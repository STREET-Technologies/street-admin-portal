import { getUsers } from "@/features/users/api/user-api";
import { getRetailers } from "@/features/retailers/api/retailer-api";
import { getOrders } from "@/features/orders/api/order-api";
import { toUserViewModel } from "@/features/users/types";
import { toRetailerViewModel } from "@/features/retailers/types";
import { toOrderViewModel } from "@/features/orders/types";

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
// Global search aggregator
// ---------------------------------------------------------------------------

/**
 * Aggregates results from user, vendor, and order search endpoints in parallel.
 *
 * Each endpoint is called via Promise.allSettled so a single failure
 * does not block the entire search.
 */
export async function globalSearch(query: string): Promise<SearchResults> {
  const [usersResponse, vendorsResponse, ordersResponse] =
    await Promise.allSettled([
      getUsers({ search: query, page: 1, limit: 5 }),
      getRetailers({ name: query, page: 1, limit: 5 }),
      getOrders({ search: query, page: 1, limit: 5 }),
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

  // Transform order results
  const orders: SearchResultItem[] =
    ordersResponse.status === "fulfilled"
      ? ordersResponse.value.data.map((backendOrder) => {
          const vm = toOrderViewModel(backendOrder);
          return {
            id: vm.id,
            type: "order" as const,
            title: vm.orderId,
            subtitle: `${vm.customerName} - ${vm.totalAmount}`,
            status: vm.status,
            href: `/orders/${vm.orderId}`,
          };
        })
      : [];

  return { users, retailers, orders };
}
