import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/couriers/")({
  component: CouriersPage,
});

function CouriersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Couriers" description="Manage courier accounts" />
      <EmptyState
        icon={Truck}
        title="Couriers coming soon"
        description="Courier list and detail views will be built in Phase 3."
      />
    </div>
  );
}
