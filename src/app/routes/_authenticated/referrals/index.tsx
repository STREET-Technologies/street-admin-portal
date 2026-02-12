import { createFileRoute } from "@tanstack/react-router";
import { ReferralListPage } from "@/features/referrals/components/ReferralListPage";

export const Route = createFileRoute("/_authenticated/referrals/")({
  component: ReferralListPage,
});
