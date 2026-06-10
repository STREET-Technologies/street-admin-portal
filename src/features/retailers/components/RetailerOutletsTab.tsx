import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  useRetailerOutletsQuery,
  useSetOutletPublishedMutation,
} from "../api/retailer-queries";

interface RetailerOutletsTabProps {
  retailerId: string;
}

export function RetailerOutletsTab({ retailerId }: RetailerOutletsTabProps) {
  const { canWrite } = useAdminRole();
  const { data: outlets, isLoading, isError } = useRetailerOutletsQuery(retailerId);
  const publishMutation = useSetOutletPublishedMutation(retailerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Failed to load outlets.</p>
      </div>
    );
  }

  if (!outlets?.length) {
    return (
      <EmptyState
        icon={MapPin}
        title="No outlets captured"
        description="This retailer installed before multi-location support — outlets will appear after their next app sync."
      />
    );
  }

  async function handlePublishToggle(outletId: string, isPublished: boolean) {
    try {
      await publishMutation.mutateAsync({ outletId, isPublished });
      toast.success(isPublished ? "Outlet published" : "Outlet unpublished");
    } catch {
      toast.error("Failed to update outlet");
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        {outlets.length} outlet{outlets.length === 1 ? "" : "s"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {outlets.map((outlet) => {
          const addressLine = [outlet.address, outlet.city, outlet.postcode]
            .filter(Boolean)
            .join(", ");
          const isPending =
            publishMutation.isPending &&
            publishMutation.variables?.outletId === outlet.id;

          return (
            <Card key={outlet.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 leading-tight">{outlet.name}</span>
                  {outlet.isPrimary && (
                    <span className="inline-flex items-center rounded-full bg-[#CDFF00]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                      Primary
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {addressLine && (
                  <p className="text-muted-foreground">{addressLine}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wider ${
                      outlet.isPublished
                        ? "bg-[hsl(var(--status-delivered-bg))] text-[hsl(var(--status-delivered-fg))]"
                        : "bg-[hsl(var(--status-cancelled-bg))] text-[hsl(var(--status-cancelled-fg))]"
                    }`}
                  >
                    {outlet.isPublished ? "PUBLISHED" : "DORMANT"}
                  </span>

                  {outlet.latitude == null && (
                    <span
                      className="inline-flex items-center rounded-full bg-[hsl(var(--status-stuck-bg))] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[hsl(var(--status-stuck-fg))]"
                      title="Won't appear in discovery until geocoded"
                    >
                      NO COORDINATES
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {outlet.isPublished ? "Published" : "Dormant"}
                  </span>
                  <Switch
                    checked={outlet.isPublished}
                    onCheckedChange={(checked) =>
                      void handlePublishToggle(outlet.id, checked)
                    }
                    disabled={!canWrite || isPending}
                    size="sm"
                    className="data-[state=checked]:bg-[#CDFF00] dark:data-[state=checked]:bg-[#CDFF00]"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
