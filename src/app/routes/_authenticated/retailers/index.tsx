import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Store } from "lucide-react";

export const Route = createFileRoute("/_authenticated/retailers/")({
  component: RetailersPage,
});

function RetailersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Retailers" description="Manage retailer accounts" />
      <EmptyState
        icon={Store}
        title="Retailers coming soon"
        description="Retailer list and detail views will be built in Phase 2."
      />
    </div>
  );
}
