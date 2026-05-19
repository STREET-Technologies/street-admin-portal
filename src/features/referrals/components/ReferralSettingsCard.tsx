import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableField } from "@/components/shared/EditableField";
import { ErrorState } from "@/components/shared/ErrorState";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import {
  useReferralSettingsQuery,
  useUpdateReferralSettingsMutation,
} from "../api/referral-queries";

/**
 * Referral program section.
 *
 * Renders as a flat page section (matches PlatformConfigCard).
 * The Active switch lives on the right of the section header.
 */
export function ReferralSettingsCard() {
  const { canWrite } = useAdminRole();
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useReferralSettingsQuery();
  const mutation = useUpdateReferralSettingsMutation();

  async function saveField(field: string, value: string) {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) throw new Error("Invalid number");
    await mutation.mutateAsync({ [field]: numVal });
  }

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Referral program</h2>
          <p className="text-sm text-muted-foreground">
            Configure reward amounts and program behaviour.
          </p>
        </div>
        {settings && (
          <div className="flex items-center gap-2">
            <Label htmlFor="referral-active" className="text-sm">
              {settings.isActive ? "Active" : "Inactive"}
            </Label>
            <Switch
              id="referral-active"
              checked={settings.isActive}
              onCheckedChange={(checked) =>
                mutation.mutate({ isActive: checked })
              }
              disabled={!canWrite}
            />
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : isError || !settings ? (
        <ErrorState
          title="Failed to load referral settings"
          message={error instanceof Error ? error.message : "Settings not found"}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EditableField
            label="Friend reward (GBP)"
            value={String(settings.defaultFriendRewardValue)}
            onSave={(v) => saveField("defaultFriendRewardValue", v)}
            disabled={!canWrite}
          />
          <EditableField
            label="Referrer reward (GBP)"
            value={String(settings.defaultReferrerRewardValue)}
            onSave={(v) => saveField("defaultReferrerRewardValue", v)}
            disabled={!canWrite}
          />
          <EditableField
            label="Min. order amount (GBP)"
            value={String(settings.defaultMinimumOrderAmount)}
            onSave={(v) => saveField("defaultMinimumOrderAmount", v)}
            disabled={!canWrite}
          />
          <EditableField
            label="Max uses per code"
            value={
              settings.maxUsesPerCode != null
                ? String(settings.maxUsesPerCode)
                : "Unlimited"
            }
            onSave={(v) => {
              if (v.toLowerCase() === "unlimited") {
                return Promise.resolve();
              }
              return saveField("maxUsesPerCode", v);
            }}
            disabled={!canWrite}
          />
          <EditableField
            label="Code expiry (days)"
            value={
              settings.codeExpiryDays != null
                ? String(settings.codeExpiryDays)
                : "Never"
            }
            onSave={(v) => {
              if (v.toLowerCase() === "never") {
                return Promise.resolve();
              }
              return saveField("codeExpiryDays", v);
            }}
            disabled={!canWrite}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Credit cap
            </p>
            <p className="text-sm tabular-nums">
              {"£"}25.00{" "}
              <span className="text-xs text-muted-foreground">
                (hardcoded in CreditService)
              </span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
