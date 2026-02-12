import { createFileRoute } from "@tanstack/react-router";
import { UserListPage } from "@/features/users/components/UserListPage";

export const Route = createFileRoute("/_authenticated/users/")({
  component: UserListPage,
});
