import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import type { EntityType } from "@/types";

interface AccountTabProps {
  entityId: string;
  entityType: EntityType;
}

export function AccountTab({ entityId, entityType }: AccountTabProps) {
  return (
    <div className="space-y-6">
      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account Security & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">Two-Factor Auth</h4>
              <p className="text-sm text-green-600">Enabled</p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Account Status</h4>
              <p className="text-sm text-blue-600">Verified & Active</p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">Privacy Level</h4>
              <p className="text-sm text-yellow-600">Standard</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
