import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyableField } from "@/components/shared/CopyableField";
import { EditableField } from "@/components/shared/EditableField";
import { useUpdateRetailerMutation } from "../api/retailer-queries";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { VENDOR_CATEGORIES } from "../constants/categories";
import type { RetailerViewModel } from "../types";

interface RetailerOverviewTabProps {
  retailer: RetailerViewModel;
}

export function RetailerOverviewTab({ retailer }: RetailerOverviewTabProps) {
  const { canWrite } = useAdminRole();
  const updateRetailer = useUpdateRetailerMutation(retailer.id);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Contact information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
        </CardContent>
      </Card>

      {/* Business details */}
      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
