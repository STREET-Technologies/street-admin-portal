import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/features/admin-users/components/AdminUsersPage";

export const Route = createFileRoute("/_authenticated/admin-users/")({
  component: AdminUsersPage,
});
