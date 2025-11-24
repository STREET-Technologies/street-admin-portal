import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon } from "lucide-react";
import { ReferralSettingsTab } from "./settings/ReferralSettingsTab";

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("referrals");

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Admin Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and defaults
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 lg:w-[400px]">
              <TabsTrigger value="referrals">Referral Defaults</TabsTrigger>
              {/* Add more tabs here in the future */}
            </TabsList>

            <TabsContent value="referrals" className="mt-6">
              <ReferralSettingsTab />
            </TabsContent>

            {/* Future tabs */}
            {/* <TabsContent value="system">System Settings</TabsContent> */}
            {/* <TabsContent value="payments">Payment Settings</TabsContent> */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
