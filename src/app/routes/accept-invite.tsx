import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AcceptInvitePage } from "@/features/admin-users/components/AcceptInvitePage";

const searchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/accept-invite")({
  component: AcceptInvitePage,
  validateSearch: searchSchema,
});
