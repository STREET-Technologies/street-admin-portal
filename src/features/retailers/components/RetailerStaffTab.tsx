import { useState } from "react";
import { Loader2, Mail, Phone, Plus, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRetailerStaffQuery } from "../api/retailer-queries";
import { AddStaffDialog } from "./AddStaffDialog";

interface RetailerStaffTabProps {
  retailerId: string;
}

export function RetailerStaffTab({ retailerId }: RetailerStaffTabProps) {
  const { data: staff, isLoading } = useRetailerStaffQuery(retailerId);
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <Button size="sm" onClick={() => setDialogOpen(true)}>
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
            return (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="size-4 text-muted-foreground" />
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
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
                  <p className="text-xs text-muted-foreground">
                    Added{" "}
                    {new Date(member.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
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
