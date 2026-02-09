import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Application configuration" />
      <EmptyState
        icon={Settings}
        title="Coming in Phase 5"
        description="Settings including referral configuration will be built in Phase 5."
      />
    </div>
  );
}
