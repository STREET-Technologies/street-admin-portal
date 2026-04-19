import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableField } from "@/components/shared/EditableField";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { usePlatformConfigQuery, useUpdatePlatformConfigMutation } from "../api/platform-config-queries";

export function PlatformConfigCard() {
  const { canWrite } = useAdminRole();
  const { data: config, isLoading, isError, refetch } = usePlatformConfigQuery();
  const mutation = useUpdatePlatformConfigMutation();

  if (isLoading) return <LoadingState variant="card" />;
  if (isError || !config) {
    return (
      <ErrorState
        title="Failed to load platform config"
        message="Could not load fee configuration."
        onRetry={() => void refetch()}
      />
    );
  }

  async function saveField(field: string, value: string) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) throw new Error("Invalid amount");
    await mutation.mutateAsync({ [field]: num });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Fees</CardTitle>
        <CardDescription>
          Delivery and service fees charged on orders. Changes apply to new orders immediately.
          Note: changing the delivery fee also requires updating the Shopify shipping rate on each retailer's store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <EditableField
          label="Delivery Fee (£)"
          value={String(config.deliveryFeeGbp)}
          onSave={(val) => saveField("deliveryFeeGbp", val)}
          disabled={!canWrite}
        />
        <EditableField
          label="Service Fee (£)"
          value={String(config.serviceFeeGbp)}
          onSave={(val) => saveField("serviceFeeGbp", val)}
          disabled={!canWrite}
        />
      </CardContent>
    </Card>
  );
}
