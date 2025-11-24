import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Store, Package, MessageSquare, Shield } from "lucide-react";
import { OverviewTab } from "./user-tabs/OverviewTab";
import { ReferralsTab } from "./user-tabs/ReferralsTab";
import { OrdersTab } from "./user-tabs/OrdersTab";
import { NotesTab } from "./user-tabs/NotesTab";
import { AccountTab } from "./user-tabs/AccountTab";
import type { User as UserType, Retailer, Courier, EntityType } from "@/types";

interface UserCardProps {
  data: UserType | Retailer | Courier;
  type: EntityType;
  onUserDataEnriched?: (totalOrders: number, totalSpent: number) => void;
}

export function UserCard({ data, type, onUserDataEnriched }: UserCardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [localData, setLocalData] = useState(data);

  const handleDataUpdate = (updatedData: any) => {
    setLocalData(updatedData);
    // Also update parent data object
    Object.assign(data, updatedData);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full mb-6" style={{ gridTemplateColumns: `repeat(${type === 'user' ? 5 : type === 'retail' ? 4 : 3}, minmax(0, 1fr))` }}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>

            {type === 'user' && (
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Referrals
              </TabsTrigger>
            )}

            {(type === 'user' || type === 'retail') && (
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </TabsTrigger>
            )}

            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes
            </TabsTrigger>

            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              data={localData}
              type={type}
              onDataUpdate={handleDataUpdate}
            />
          </TabsContent>

          {type === 'user' && (
            <TabsContent value="referrals">
              <ReferralsTab userId={localData.id} />
            </TabsContent>
          )}

          {(type === 'user' || type === 'retail') && (
            <TabsContent value="orders">
              <OrdersTab
                entityId={localData.id}
                entityType={type}
              />
            </TabsContent>
          )}

          <TabsContent value="notes">
            <NotesTab
              entityId={localData.id}
              entityName={localData.name}
              entityType={type}
            />
          </TabsContent>

          <TabsContent value="account">
            <AccountTab
              entityId={localData.id}
              entityType={type}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
