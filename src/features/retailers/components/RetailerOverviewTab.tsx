import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyableField } from "@/components/shared/CopyableField";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { RetailerViewModel } from "../types";

interface RetailerOverviewTabProps {
  retailer: RetailerViewModel;
}

export function RetailerOverviewTab({ retailer }: RetailerOverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {retailer.email && (
            <CopyableField label="Email" value={retailer.email} />
          )}
          {retailer.phone && (
            <CopyableField label="Phone" value={retailer.phone} />
          )}
          {retailer.address && (
            <CopyableField label="Address" value={retailer.address} />
          )}
          {!retailer.email && !retailer.phone && !retailer.address && (
            <p className="text-sm text-muted-foreground">
              No contact information available.
            </p>
          )}
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
          {retailer.commissionPercentage !== null && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Commission</p>
              <p className="text-sm">{retailer.commissionPercentage}%</p>
            </div>
          )}
          {retailer.stripeAccountId && (
            <CopyableField
              label="Stripe Account"
              value={retailer.stripeAccountId}
              mono
            />
          )}
          {retailer.storeUrl && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Store URL</p>
              <a
                href={retailer.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {retailer.storeUrl}
              </a>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Online Status</p>
            <StatusBadge
              status={retailer.isOnline ? "active" : "inactive"}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description (if present, full-width) */}
      {retailer.description && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {retailer.description}
            </p>
          </CardContent>
        </Card>
      )}

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
