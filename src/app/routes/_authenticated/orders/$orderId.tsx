import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  component: OrderDetailRoute,
});

function OrderDetailRoute() {
  const { orderId } = Route.useParams();
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${orderId.slice(0, 8)}...`}
        description="Order details"
      />
      <EmptyState
        icon={ShoppingCart}
        title="Order detail coming soon"
        description="The order detail view will be built in a future plan."
      />
    </div>
  );
}
