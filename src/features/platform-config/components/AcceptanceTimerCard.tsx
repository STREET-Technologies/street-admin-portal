import { EditableField } from "@/components/shared/EditableField";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  usePlatformConfigQuery,
  useUpdatePlatformConfigMutation,
} from "../api/platform-config-queries";

/**
 * Order acceptance timeout (TT-258).
 *
 * Controls how long a retailer has to accept an incoming order before it
 * auto-misses. Shares the platform_config object with the fees section. A value
 * of 0 disables the timer entirely (orders never auto-miss). Changes apply to
 * new orders within ~5 minutes (backend config cache) with no deploy.
 */
export function AcceptanceTimerCard() {
  const { canWrite } = useAdminRole();
  const { data: config, isLoading, isError, refetch } = usePlatformConfigQuery();
  const mutation = useUpdatePlatformConfigMutation();

  async function saveTimeout(value: string) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      throw new Error("Enter 0 or a positive whole number of seconds");
    }
    await mutation.mutateAsync({ acceptanceTimeoutSeconds: num });
  }

  const isDisabled = config?.acceptanceTimeoutSeconds === 0;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Order acceptance</h2>
        <p className="text-sm text-muted-foreground">
          How long a retailer has to accept an incoming order before it
          auto-misses. Set to <strong>0</strong> to disable the timer entirely —
          orders then stay awaiting acceptance until handled manually. Changes
          apply to new orders within about 5 minutes, no deploy needed.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12" />
        </div>
      ) : isError || !config ? (
        <ErrorState
          title="Failed to load acceptance timeout"
          message="Could not load the order acceptance configuration."
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="space-y-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <EditableField
              label="Acceptance timeout (seconds)"
              value={String(config.acceptanceTimeoutSeconds)}
              onSave={saveTimeout}
              disabled={!canWrite}
            />
          </div>
          {isDisabled ? (
            <p className="text-sm font-medium text-amber-600">
              Auto-miss is currently disabled — orders never time out.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
