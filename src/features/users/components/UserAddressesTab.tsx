import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyableField } from "@/components/shared/CopyableField";
import { EditableField } from "@/components/shared/EditableField";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  useUserAddressesQuery,
  useUpdateUserAddressMutation,
} from "../api/user-queries";
import type { BackendUserAddress } from "../types";
import type { AddressValidationVerdict } from "@/types";

interface UserAddressesTabProps {
  userId: string;
}

// Explains the courier-bookability failure and how to fix it (TT-428).
// Only 'invalid_postcode' and 'postcode_mismatch' warrant a warning — never
// alarm on 'valid', 'unknown', or null (unverified).
const ADDRESS_VERDICT_COPY: Record<string, string> = {
  invalid_postcode:
    "Postcode does not exist or was terminated. Deliveries to this address will fail at dispatch.",
  postcode_mismatch:
    "Street and postcode don't match. Deliveries to this address may fail at dispatch.",
};

function getAddressWarning(verdict: AddressValidationVerdict): string | null {
  return verdict != null ? (ADDRESS_VERDICT_COPY[verdict] ?? null) : null;
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

/**
 * Address text (line1/city/postcode) is deliberately NOT editable here:
 * coordinates are set by the client app's address picker and the backend does
 * not re-geocode on PATCH, so a text edit would silently leave the Stuart
 * delivery pin at the old location. Only geo-safe fields are editable.
 */
export function UserAddressesTab({ userId }: UserAddressesTabProps) {
  const { canWrite } = useAdminRole();
  const { data: addresses, isLoading, isError, error, refetch } =
    useUserAddressesQuery(userId);
  const updateAddress = useUpdateUserAddressMutation(userId);

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
      {addresses.map((address) => {
        const addressWarning = getAddressWarning(address.addressValidationVerdict);

        return (
          <div key={address.id} className="rounded-md border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{address.label ?? "Address"}</h3>
              <div className="flex items-center gap-2">
                {addressWarning && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="destructive" className="cursor-default">
                        Address not courier-bookable
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">
                      {addressWarning}
                    </TooltipContent>
                  </Tooltip>
                )}
                {address.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <CopyableField label="Full Address" value={formatAddress(address)} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    City
                  </p>
                  <p className="text-sm">{address.city}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Postcode
                  </p>
                  <p className="text-sm">{address.postcode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <EditableField
                  label="Label"
                  value={address.label ?? ""}
                  onSave={async (val) => {
                    await updateAddress.mutateAsync({
                      addressId: address.id,
                      data: { label: val },
                    });
                  }}
                  disabled={!canWrite}
                />
              </div>
              <EditableField
                label="Delivery instructions"
                value={address.deliveryInstructions ?? ""}
                onSave={async (val) => {
                  await updateAddress.mutateAsync({
                    addressId: address.id,
                    data: { deliveryInstructions: val },
                  });
                }}
                disabled={!canWrite}
              />
              {address.latitude != null && address.longitude != null && (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Coordinates
                  </p>
                  <p className="font-mono text-xs text-muted-foreground tabular-nums">
                    {Number(address.latitude).toFixed(6)}, {Number(address.longitude).toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
