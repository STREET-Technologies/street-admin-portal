import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Separator } from "@/components/ui/separator";
import { ReferralSettingsCard } from "@/features/referrals/components/ReferralSettingsCard";
import { PlatformConfigCard } from "@/features/platform-config/components/PlatformConfigCard";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Application configuration" />
      <PlatformConfigCard />
      <Separator />
      <ReferralSettingsCard />
    </div>
  );
}
