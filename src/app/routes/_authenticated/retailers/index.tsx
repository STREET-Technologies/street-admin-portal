import { createFileRoute } from "@tanstack/react-router";
import { RetailerListPage } from "@/features/retailers/components/RetailerListPage";

export const Route = createFileRoute("/_authenticated/retailers/")({
  component: RetailerListPage,
});
