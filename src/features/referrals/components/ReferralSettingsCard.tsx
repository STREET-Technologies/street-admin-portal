import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditableField } from "@/components/shared/EditableField";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  useReferralSettingsQuery,
  useUpdateReferralSettingsMutation,
} from "../api/referral-queries";

export function ReferralSettingsCard() {
  const { data: settings, isLoading, isError, error, refetch } =
    useReferralSettingsQuery();
  const mutation = useUpdateReferralSettingsMutation();

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  if (isError || !settings) {
    return (
      <ErrorState
        title="Failed to load referral settings"
        message={
          error instanceof Error ? error.message : "Settings not found"
        }
        onRetry={() => void refetch()}
      />
    );
  }

  async function saveField(field: string, value: string) {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) throw new Error("Invalid number");
    await mutation.mutateAsync({ [field]: numVal });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Referral Program</CardTitle>
            <CardDescription>
              Configure reward amounts and program behaviour
            </CardDescription>
          </div>
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
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <EditableField
            label="Friend reward (GBP)"
            value={String(settings.defaultFriendRewardValue)}
            onSave={(v) => saveField("defaultFriendRewardValue", v)}
          />
          <EditableField
            label="Referrer reward (GBP)"
            value={String(settings.defaultReferrerRewardValue)}
            onSave={(v) => saveField("defaultReferrerRewardValue", v)}
          />
          <EditableField
            label="Min. order amount (GBP)"
            value={String(settings.defaultMinimumOrderAmount)}
            onSave={(v) => saveField("defaultMinimumOrderAmount", v)}
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
                // Can't unset via PATCH easily; keep as-is
                return Promise.resolve();
              }
              return saveField("maxUsesPerCode", v);
            }}
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
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Credit cap
            </p>
            <p className="text-sm">
              {"\u00A3"}25.00{" "}
              <span className="text-xs text-muted-foreground">
                (hardcoded in CreditService)
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
