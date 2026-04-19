import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyableField } from "@/components/shared/CopyableField";
import { EditableField } from "@/components/shared/EditableField";
import { formatDate } from "@/lib/format-utils";
import { useUpdateRetailerMutation } from "../api/retailer-queries";
import type { RetailerViewModel } from "../types";

interface RetailerOverviewTabProps {
  retailer: RetailerViewModel;
}

export function RetailerOverviewTab({ retailer }: RetailerOverviewTabProps) {
  const updateRetailer = useUpdateRetailerMutation(retailer.id);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EditableField
            label="Email"
            value={retailer.email || "No email"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ email: val });
            }}
          />
          <EditableField
            label="Phone"
            value={retailer.phone || "No phone"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ phone: val });
            }}
          />
          <EditableField
            label="Street Address"
            value={retailer.address || "No address"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ address: val });
            }}
          />
          <EditableField
            label="Postcode"
            value={retailer.postcode || "No postcode"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ postcode: val });
            }}
          />
          <EditableField
            label="Latitude"
            value={retailer.latitude !== null ? String(retailer.latitude) : ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ latitude: parseFloat(val) });
            }}
          />
          <EditableField
            label="Longitude"
            value={retailer.longitude !== null ? String(retailer.longitude) : ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ longitude: parseFloat(val) });
            }}
          />
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyableField label="ID" value={retailer.id} mono />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Category</p>
            <p className="text-sm">{retailer.category}</p>
          </div>
          <EditableField
            label="Commission (%)"
            value={retailer.commissionPercentage !== null ? String(retailer.commissionPercentage) : ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ commissionPercentage: parseFloat(val) });
            }}
          />
          <EditableField
            label="Store URL"
            value={retailer.storeUrl || ""}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ storeUrl: val });
            }}
          />
        </CardContent>
      </Card>

      {/* Description (editable, full-width) */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableField
            label="Description"
            value={retailer.description || "No description"}
            onSave={async (val) => {
              await updateRetailer.mutateAsync({ description: val });
            }}
          />
        </CardContent>
      </Card>

      {/* Dates */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-12">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Created</p>
              <p className="text-sm">
                {formatDate(retailer.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Updated</p>
              <p className="text-sm">
                {formatDate(retailer.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
