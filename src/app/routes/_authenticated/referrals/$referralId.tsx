import { createFileRoute } from "@tanstack/react-router";
import { ReferralDetailPage } from "@/features/referrals/components/ReferralDetailPage";

export const Route = createFileRoute("/_authenticated/referrals/$referralId")({
  component: ReferralDetailRoute,
});

function ReferralDetailRoute() {
  const { referralId } = Route.useParams();
  return <ReferralDetailPage referralId={referralId} />;
}
