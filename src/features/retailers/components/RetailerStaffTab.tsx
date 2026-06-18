import { useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format-utils";
import {
  useRetailerStaffQuery,
  useRetailerOutletsQuery,
  useSetStaffOutletMutation,
  useResetStaffPasswordMutation,
  useSetStaffDisabledMutation,
} from "../api/retailer-queries";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import { AddStaffDialog } from "./AddStaffDialog";

// Sentinel for the "Owner / HQ" option — Radix Select disallows empty values.
const OWNER_VALUE = "__owner__";

interface RetailerStaffTabProps {
  retailerId: string;
}

export function RetailerStaffTab({ retailerId }: RetailerStaffTabProps) {
  const { canWrite } = useAdminRole();
  const { data: staff, isLoading } = useRetailerStaffQuery(retailerId);
  const { data: outlets } = useRetailerOutletsQuery(retailerId);
  const setOutletMutation = useSetStaffOutletMutation(retailerId);
  const resetPasswordMutation = useResetStaffPasswordMutation(retailerId);
  const setDisabledMutation = useSetStaffDisabledMutation(retailerId);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleOutletChange(userId: string, value: string) {
    try {
      await setOutletMutation.mutateAsync({
        userId,
        outletId: value === OWNER_VALUE ? null : value,
      });
      toast.success("Staff access updated");
    } catch {
      toast.error("Failed to update staff access");
    }
  }

  async function handleResetPassword(userId: string, email: string | null) {
    if (
      !window.confirm(
        `Send a password-reset email to ${email ?? "this account"}? Their current password will stop working immediately.`,
      )
    ) {
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync(userId);
      toast.success(`Reset email sent to ${email ?? "the account"}`);
    } catch {
      toast.error("Failed to send reset email");
    }
  }

  async function handleToggleDisabled(userId: string, currentlyDisabled: boolean) {
    if (
      !currentlyDisabled &&
      !window.confirm(
        "Deactivate this account? They will be logged out and unable to sign into the retailer app until reactivated.",
      )
    ) {
      return;
    }
    try {
      await setDisabledMutation.mutateAsync({
        userId,
        disabled: !currentlyDisabled,
      });
      toast.success(
        currentlyDisabled
          ? "Account reactivated"
          : "Account deactivated — active sessions dropped",
      );
    } catch {
      toast.error("Failed to update account status");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {staff?.length
            ? `${staff.length} staff account${staff.length === 1 ? "" : "s"}`
            : "No staff accounts"}
        </h3>
        <Button size="sm" onClick={() => setDialogOpen(true)} disabled={!canWrite}>
          <Plus className="mr-1.5 size-4" />
          Add Staff
        </Button>
      </div>

      {!staff?.length ? (
        <EmptyState
          icon={User}
          title="No staff accounts"
          description="No user accounts are linked to this retailer."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => {
            const name =
              [member.firstName, member.lastName].filter(Boolean).join(" ") ||
              "Unnamed";
            const disabled = member.isAdminDisabled;
            const isRowBusy =
              (resetPasswordMutation.isPending &&
                resetPasswordMutation.variables === member.id) ||
              (setDisabledMutation.isPending &&
                setDisabledMutation.variables?.userId === member.id);
            return (
              <div
                key={member.id}
                className={`rounded-md border bg-card p-5 ${disabled ? "opacity-60" : ""}`}
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <User className="size-4 text-muted-foreground" />
                  {name}
                  {disabled && (
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
                      Deactivated
                    </span>
                  )}
                </h3>
                <div className="mt-3 space-y-1.5 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-3.5" />
                      {member.email}
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-3.5" />
                      {member.phone}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Added {formatDate(member.createdAt)}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Store className="size-3.5" />
                    Access
                  </span>
                  <Select
                    value={member.outletId ?? OWNER_VALUE}
                    onValueChange={(v) => void handleOutletChange(member.id, v)}
                    disabled={
                      !canWrite ||
                      (setOutletMutation.isPending &&
                        setOutletMutation.variables?.userId === member.id)
                    }
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OWNER_VALUE}>
                        Owner / HQ — all branches
                      </SelectItem>
                      {(outlets ?? []).map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={!canWrite || isRowBusy}
                    onClick={() =>
                      void handleResetPassword(member.id, member.email)
                    }
                  >
                    <KeyRound className="mr-1 size-3.5" />
                    Reset password
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 text-xs ${disabled ? "" : "text-destructive hover:text-destructive"}`}
                    disabled={!canWrite || isRowBusy}
                    onClick={() =>
                      void handleToggleDisabled(member.id, disabled)
                    }
                  >
                    {disabled ? (
                      <>
                        <ShieldCheck className="mr-1 size-3.5" />
                        Reactivate
                      </>
                    ) : (
                      <>
                        <Ban className="mr-1 size-3.5" />
                        Deactivate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddStaffDialog
        retailerId={retailerId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
