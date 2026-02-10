import { Loader2, Mail, Phone, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRetailerStaffQuery } from "../api/retailer-queries";

interface RetailerStaffTabProps {
  retailerId: string;
}

export function RetailerStaffTab({ retailerId }: RetailerStaffTabProps) {
  const { data: staff, isLoading } = useRetailerStaffQuery(retailerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!staff?.length) {
    return (
      <EmptyState
        icon={User}
        title="No staff accounts"
        description="No user accounts are linked to this retailer."
      />
    );
  }

  return (
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
  );
}
