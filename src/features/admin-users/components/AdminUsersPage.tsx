import { useState } from "react";
import { KeyRound, Loader2, Mail, Shield, UserCheck, UserPlus, UserX, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        toast.success("Account suspended — active sessions invalidated");
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminUsers.map((admin) => (
          <Card
            key={admin.id}
            className={admin.isAdminDisabled ? "opacity-60" : undefined}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="size-4 shrink-0 text-muted-foreground" />
                  <span className={`truncate ${admin.isAdminDisabled ? "line-through text-muted-foreground" : ""}`}>
                    {admin.name}
                  </span>
                  {currentUser?.email === admin.email && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                      You
                    </span>
                  )}
                  {admin.isAdminDisabled && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      Suspended
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && currentUser?.email !== admin.email ? (
                    <>
                      {!admin.isAdminDisabled && (
                        <Select
                          value={admin.adminRole}
                          onValueChange={(v) => handleRoleChange(admin.id, v as AdminRole)}
                        >
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`size-6 ${admin.isAdminDisabled ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground hover:text-destructive"}`}
                        onClick={() => void handleToggleDisabled(admin.id, admin.isAdminDisabled)}
                        disabled={disableMutation.isPending || enableMutation.isPending}
                        aria-label={admin.isAdminDisabled ? "Re-enable account" : "Suspend account"}
                        title={admin.isAdminDisabled ? "Re-enable account" : "Suspend account"}
                      >
                        {admin.isAdminDisabled
                          ? <UserCheck className="size-3.5" />
                          : <UserX className="size-3.5" />
                        }
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize shrink-0">
                      {admin.adminRole ?? "admin"}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{admin.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Added {formatDate(admin.createdAt)}
              </p>
            </CardContent>
          </Card>
        ))}
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
