import { useState } from "react";
import { KeyRound, Loader2, Shield, UserPlus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAdminRole } from "@/features/auth/hooks/useAdminRole";
import type { AdminRole } from "@/features/auth/types";
import { formatDate } from "@/lib/format-utils";
import { useAdminUsersQuery, useDisableAdminUserMutation, useEnableAdminUserMutation } from "../api/admin-users-queries";
import { updateAdminUserRole } from "../api/admin-users-api";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { InviteAdminDialog } from "./InviteAdminDialog";
import {
  usePendingInvitesQuery,
  useRevokeInviteMutation,
} from "../api/invites-queries";

export function AdminUsersPage() {
  const { canWrite, isAdmin } = useAdminRole();
  const { data: adminUsers, isLoading, refetch } = useAdminUsersQuery();
  const { user: currentUser } = useAuth();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: pendingInvites = [] } = usePendingInvitesQuery();
  const revokeMutation = useRevokeInviteMutation();
  const disableMutation = useDisableAdminUserMutation();
  const enableMutation = useEnableAdminUserMutation();

  async function handleToggleDisabled(userId: string, currentlyDisabled: boolean) {
    try {
      if (currentlyDisabled) {
        await enableMutation.mutateAsync(userId);
        toast.success("Account re-enabled");
      } else {
        await disableMutation.mutateAsync(userId);
        toast.success("Access disabled — active sessions invalidated");
      }
    } catch {
      toast.error("Failed to update account status");
    }
  }

  async function handleRoleChange(userId: string, newRole: AdminRole) {
    try {
      await updateAdminUserRole(userId, newRole);
      await refetch();
    } catch {
      toast.error("Failed to update role");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Team"
          description="Manage user accounts"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!adminUsers?.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Team"
          description="Manage user accounts"
        />
        <EmptyState
          icon={Shield}
          title="No admin users found"
          description="No admin accounts exist in the system."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Manage user accounts">
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)} size="sm" className="bg-[#CDFF00] text-black hover:bg-[#CDFF00]/85">
            <UserPlus className="mr-2 size-4" />
            Invite
          </Button>
        )}
        <Button onClick={() => setPasswordDialogOpen(true)} disabled={!canWrite} size="sm" className="bg-[#CDFF00] text-black hover:bg-[#CDFF00]/85">
          <KeyRound className="mr-2 size-4" />
          Change My Password
        </Button>
      </PageHeader>

      {/* Team list — one row per admin user, matching the Pending Invites pattern */}
      <div className="divide-y rounded-lg border">
        {adminUsers.map((admin) => {
          const isYou = currentUser?.email === admin.email;
          const canManageThisRow = isAdmin && !isYou;
          return (
            <div
              key={admin.id}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3",
                admin.isAdminDisabled && "opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      admin.isAdminDisabled &&
                        "line-through text-muted-foreground",
                    )}
                  >
                    {admin.name}
                  </p>
                  {isYou && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      You
                    </span>
                  )}
                  {admin.isAdminDisabled && (
                    <Badge
                      variant="outline"
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      Disabled
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {admin.email}{" "}
                  <span className="tabular-nums">
                    · Added {formatDate(admin.createdAt)}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {canManageThisRow && !admin.isAdminDisabled ? (
                  <Select
                    value={admin.adminRole}
                    onValueChange={(v) =>
                      handleRoleChange(admin.id, v as AdminRole)
                    }
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {admin.adminRole ?? "admin"}
                  </span>
                )}

                {canManageThisRow && (
                  <button
                    type="button"
                    onClick={() =>
                      void handleToggleDisabled(admin.id, admin.isAdminDisabled)
                    }
                    disabled={
                      disableMutation.isPending || enableMutation.isPending
                    }
                    className={cn(
                      "text-xs transition-colors disabled:opacity-50",
                      admin.isAdminDisabled
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-muted-foreground hover:text-destructive",
                    )}
                  >
                    {admin.isAdminDisabled ? "Re-enable" : "Disable"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && pendingInvites.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Pending Invites ({pendingInvites.length})
          </h2>
          <div className="divide-y rounded-lg border">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {invite.adminRole} · expires{" "}
                    {formatDistanceToNow(new Date(invite.expiresAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => revokeMutation.mutate(invite.id)}
                  disabled={revokeMutation.isPending}
                  aria-label="Revoke invite"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
