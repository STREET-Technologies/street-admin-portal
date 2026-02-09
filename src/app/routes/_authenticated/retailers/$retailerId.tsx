import { createFileRoute } from "@tanstack/react-router";
import { RetailerDetailPage } from "@/features/retailers/components/RetailerDetailPage";

export const Route = createFileRoute("/_authenticated/retailers/$retailerId")({
  component: RetailerDetailRoute,
});

function RetailerDetailRoute() {
  const { retailerId } = Route.useParams();
  return <RetailerDetailPage retailerId={retailerId} />;
}
