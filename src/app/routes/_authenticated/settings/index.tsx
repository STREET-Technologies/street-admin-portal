import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReferralSettingsCard } from "@/features/referrals/components/ReferralSettingsCard";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Application configuration" />
      <ReferralSettingsCard />
    </div>
  );
}
