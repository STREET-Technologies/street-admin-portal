import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyableField } from "@/components/shared/CopyableField";
import { EditableField } from "@/components/shared/EditableField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUpdateRetailerMutation } from "../api/retailer-queries";
import type { RetailerViewModel } from "../types";

interface RetailerOverviewTabProps {
  retailer: RetailerViewModel;
}

export function RetailerOverviewTab({ retailer }: RetailerOverviewTabProps) {
  const updateRetailer = useUpdateRetailerMutation(retailer.id);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);

  async function handleOnlineToggle(checked: boolean) {
    setIsTogglingOnline(true);
    try {
      await updateRetailer.mutateAsync({ isOnline: checked });
      toast.success(checked ? "Retailer set to online" : "Retailer set to offline");
    } catch {
      toast.error("Failed to update online status");
    } finally {
      setIsTogglingOnline(false);
    }
  }

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
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Online Status</p>
            <div className="flex items-center gap-3">
              <StatusBadge
                status={retailer.isOnline ? "active" : "inactive"}
                size="sm"
              />
              <div className="flex items-center gap-2">
                {isTogglingOnline && (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                )}
                <Switch
                  id="online-toggle"
                  checked={retailer.isOnline}
                  onCheckedChange={(checked) => void handleOnlineToggle(checked)}
                  disabled={isTogglingOnline}
                  size="sm"
                />
                <Label
                  htmlFor="online-toggle"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  {retailer.isOnline ? "Online" : "Offline"}
                </Label>
              </div>
            </div>
          </div>
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
                {new Date(retailer.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Updated</p>
              <p className="text-sm">
                {new Date(retailer.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
