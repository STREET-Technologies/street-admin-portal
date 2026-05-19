import { EditableField } from "@/components/shared/EditableField";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  usePlatformConfigQuery,
  useUpdatePlatformConfigMutation,
} from "../api/platform-config-queries";

/**
 * Platform fees section (delivery + service fee).
 *
 * Renders as a flat page section — title + description + a grid of
 * editable fields — rather than a Card. Settings live next to each
 * other on a single scroll page; cards add chrome without separating
 * meaningfully different concerns.
 */
export function PlatformConfigCard() {
  const { canWrite } = useAdminRole();
  const { data: config, isLoading, isError, refetch } = usePlatformConfigQuery();
  const mutation = useUpdatePlatformConfigMutation();

  async function saveField(field: string, value: string) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) throw new Error("Invalid amount");
    await mutation.mutateAsync({ [field]: num });
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Platform fees</h2>
        <p className="text-sm text-muted-foreground">
          Delivery and service fees charged on orders. Changes apply to new
          orders immediately. Note: changing the delivery fee also requires
          updating the Shopify shipping rate on each retailer&apos;s store.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : isError || !config ? (
        <ErrorState
          title="Failed to load platform fees"
          message="Could not load fee configuration."
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <EditableField
            label="Delivery fee (£)"
            value={String(config.deliveryFeeGbp)}
            onSave={(val) => saveField("deliveryFeeGbp", val)}
            disabled={!canWrite}
          />
          <EditableField
            label="Service fee (£)"
            value={String(config.serviceFeeGbp)}
            onSave={(val) => saveField("serviceFeeGbp", val)}
            disabled={!canWrite}
          />
        </div>
      )}
    </section>
  );
}
