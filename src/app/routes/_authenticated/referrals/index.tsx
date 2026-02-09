import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backend Endpoints Needed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The referral system exists in the backend — users can share referral
            codes, claim codes from other users, and earn credit. However, no
            admin-facing API endpoints exist yet for listing, searching, or
            managing referral codes.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Endpoints needed:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                  GET /admin/referral-codes
                </code>{" "}
                — list all codes with pagination
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                  GET /admin/users/:userId/referral
                </code>{" "}
                — get a user's referral code
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                  PATCH /admin/referral-codes/:id
                </code>{" "}
                — toggle code active status
              </li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            This is tracked in the project backlog for a backend sprint.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
