import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyableField } from "@/components/shared/CopyableField";
import { EditableField } from "@/components/shared/EditableField";
import {
  useUpdateRetailerMutation,
  useResyncRetailerFromShopifyMutation,
} from "../api/retailer-queries";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { VENDOR_CATEGORIES } from "../constants/categories";
import type { RetailerViewModel } from "../types";

interface RetailerOverviewTabProps {
  retailer: RetailerViewModel;
}

export function RetailerOverviewTab({ retailer }: RetailerOverviewTabProps) {
  const { canWrite } = useAdminRole();
  const updateRetailer = useUpdateRetailerMutation(retailer.id);
  const resyncFromShopify = useResyncRetailerFromShopifyMutation(retailer.id);

  const isShopify = Boolean(retailer.storeUrl);

  const handleResync = async () => {
    try {
      await resyncFromShopify.mutateAsync();
      toast.success("Store details re-synced from Shopify");
    } catch {
      toast.error("Could not re-sync from Shopify. Please try again.");
    }
  };

  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      {/* Contact information — flat section */}
      <section>
        <h2 className="text-base font-semibold leading-none">Contact information</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5">
          <EditableField
            label="Email"
            value={retailer.email || "No email"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ email: val });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Phone"
            value={retailer.phone || "No phone"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ phone: val });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Street address"
            value={retailer.address || "No address"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ address: val });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Postcode"
            value={retailer.postcode || "No postcode"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ postcode: val });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Latitude"
            value={retailer.latitude !== null ? String(retailer.latitude) : ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ latitude: parseFloat(val) });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Longitude"
            value={retailer.longitude !== null ? String(retailer.longitude) : ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ longitude: parseFloat(val) });
            }}
            disabled={!canWrite}
          />
        </div>
      </section>

      {/* Business details — flat section */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold leading-none">Business details</h2>
          {canWrite && isShopify && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResync}
              disabled={resyncFromShopify.isPending}
              title="Re-pull store name, branding and contact details from Shopify. Address syncs separately from Shopify locations."
            >
              <RefreshCw
                className={`mr-2 h-3.5 w-3.5 ${
                  resyncFromShopify.isPending ? "animate-spin" : ""
                }`}
              />
              {resyncFromShopify.isPending ? "Re-syncing…" : "Re-sync from Shopify"}
            </Button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-5">
          <CopyableField label="ID" value={retailer.id} mono />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Category
            </p>
            <Select
              value={retailer.category ?? ""}
              onValueChange={(val) => {
                void updateRetailer.mutateAsync({ vendorCategory: val });
              }}
              disabled={!canWrite}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <EditableField
            label="Commission (%)"
            value={
              retailer.commissionPercentage !== null
                ? String(retailer.commissionPercentage)
                : ""
            }
            onSave={async (val) => {
              await updateRetailer.mutateAsync({
                commissionPercentage: parseFloat(val),
              });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Store URL"
            value={retailer.storeUrl || ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ storeUrl: val });
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Shipping & Returns URL"
            value={retailer.shippingReturnsUrl || ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ shippingReturnsUrl: val });
            }}
            disabled={!canWrite}
          />
        </div>
      </section>
    </div>
  );
}
