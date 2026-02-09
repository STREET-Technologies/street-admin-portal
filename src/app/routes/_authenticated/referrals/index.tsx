import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/referrals/")({
  component: ReferralsPage,
});

function ReferralsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Codes"
        description="Manage referral codes and promotions"
      />
      <EmptyState
        icon={Tag}
        title="Referral codes coming soon"
        description="Referral code management will be built in Phase 4."
      />
    </div>
  );
}
