import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyableField } from "@/components/shared/CopyableField";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useUserAddressesQuery } from "../api/user-queries";
import type { BackendUserAddress } from "../types";

interface UserAddressesTabProps {
  userId: string;
}

function formatAddress(address: BackendUserAddress): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.postcode,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export function UserAddressesTab({ userId }: UserAddressesTabProps) {
  const { data: addresses, isLoading, isError, error, refetch } =
    useUserAddressesQuery(userId);

  if (isLoading) {
    return <LoadingState variant="card" rows={3} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load addresses"
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No addresses"
        description="This user has not saved any addresses yet."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardHeader>
            <CardTitle className="text-sm">
              {address.label ?? "Address"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CopyableField
              label="Full Address"
              value={formatAddress(address)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  City
                </p>
                <p className="text-sm">{address.city}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Postcode
                </p>
                <p className="text-sm">{address.postcode}</p>
              </div>
            </div>
            {address.latitude != null && address.longitude != null && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Coordinates
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {Number(address.latitude).toFixed(6)}, {Number(address.longitude).toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
