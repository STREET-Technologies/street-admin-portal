import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/users/")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts" />
      <EmptyState
        icon={Users}
        title="Users coming soon"
        description="User list and detail views will be built in Phase 2."
      />
    </div>
  );
}
