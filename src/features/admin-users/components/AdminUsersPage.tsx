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
          title="Admin Users"
          description="Manage admin accounts"
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
          title="Admin Users"
          description="Manage admin accounts"
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
      <PageHeader title="Admin Users" description="Manage admin accounts">
        <Button onClick={() => setPasswordDialogOpen(true)} disabled={!canWrite}>
          <KeyRound className="mr-2 size-4" />
          Change My Password
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminUsers.map((admin) => (
          <Card key={admin.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="size-4 text-muted-foreground" />
                {admin.name}
                {currentUser?.email === admin.email && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    You
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" />
                {admin.email}
              </div>
              <p className="text-xs text-muted-foreground">
                Added{" "}
                {formatDate(admin.createdAt)}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {isAdmin && currentUser?.email !== admin.email ? (
                  <Select
                    value={admin.adminRole}
                    onValueChange={(v) => handleRoleChange(admin.id, v as AdminRole)}
                  >
                    <SelectTrigger className="w-28 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {admin.adminRole ?? "admin"}
                  </span>
                )}
              </div>
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
