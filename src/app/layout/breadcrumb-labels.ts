import type { BackendUser } from "@/features/users/types";
import { toUserViewModel } from "@/features/users/types";
import type { BackendVendor } from "@/features/retailers/types";
import { toRetailerViewModel } from "@/features/retailers/types";
import type { BackendOrder } from "@/features/orders/types";

/**
 * How to turn a cached detail entity into a breadcrumb label, keyed by the
 * parent URL segment.
 *
 * The query keys here must stay byte-identical to the ones the detail hooks
 * write, or the breadcrumb silently falls back to the raw UUID — pinned by
 * Breadcrumbs.test.ts.
 *
 * TanStack Query caches the RAW backend entity: the `select` in the detail
 * hooks transforms only what components see, not what is stored, so these
 * apply the ViewModel transform themselves.
 */
export const LABEL_RESOLVERS: Record<
  string,
  {
    queryKey: (id: string) => readonly unknown[];
    toLabel: (raw: never) => string | null;
  }
> = {
  users: {
    queryKey: (id) => ["users", "detail", id],
    toLabel: (raw: BackendUser) => toUserViewModel(raw).name || null,
  },
  retailers: {
    queryKey: (id) => ["retailers", "detail", id],
    toLabel: (raw: BackendVendor) => toRetailerViewModel(raw).name || null,
  },
  orders: {
    queryKey: (id) => ["orders", "detail", "byOrderId", id],
    toLabel: (raw: BackendOrder) => raw.orderId || null,
  },
};
