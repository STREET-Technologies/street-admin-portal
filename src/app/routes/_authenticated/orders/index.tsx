import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders/")({
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Track and manage orders" />
      <EmptyState
        icon={ShoppingCart}
        title="Orders coming soon"
        description="Order list and detail views will be built in Phase 3."
      />
    </div>
  );
}
