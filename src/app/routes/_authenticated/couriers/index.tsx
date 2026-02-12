import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/couriers/")({
  component: CouriersPage,
});

function CouriersPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Couriers"
        description="Delivery courier information"
      />
      <EmptyState
        icon={Truck}
        title="Couriers are managed by Stuart"
        description="Delivery couriers are third-party drivers provided by Stuart. Courier details (name, phone, vehicle, tracking) are available within each order's delivery section."
        action={{
          label: "View Orders",
          onClick: () => void navigate({ to: "/orders" }),
        }}
      />
    </div>
  );
}
