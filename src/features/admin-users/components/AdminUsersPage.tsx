import { useState } from "react";
import { KeyRound, Loader2, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useAdminUsersQuery } from "../api/admin-users-queries";
import { updateAdminUserRole } from "../api/admin-users-api";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export function AdminUsersPage() {
  const { canWrite, isAdmin } = useAdminRole();
  const { data: adminUsers, isLoading, refetch } = useAdminUsersQuery();
  const { user: currentUser } = useAuth();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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
        <Button onClick={() => setPasswordDialogOpen(true)} disabled={!canWrite}>
          <KeyRound className="mr-2 size-4" />
          Change My Password
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminUsers.map((admin) => (
          <Card key={admin.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{admin.name}</span>
                  {currentUser?.email === admin.email && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
                      You
                    </span>
                  )}
                </CardTitle>
                {isAdmin && currentUser?.email !== admin.email ? (
                  <Select
                    value={admin.adminRole}
                    onValueChange={(v) => handleRoleChange(admin.id, v as AdminRole)}
                  >
                    <SelectTrigger className="w-24 h-6 text-xs shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize shrink-0">
                    {admin.adminRole ?? "admin"}
                  </span>
                )}
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

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}
