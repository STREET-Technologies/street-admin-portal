import { createFileRoute } from "@tanstack/react-router";
import { OrderListPage } from "@/features/orders/components/OrderListPage";

export const Route = createFileRoute("/_authenticated/orders/")({
  component: OrderListPage,
});
