import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket, Plus, Settings } from "lucide-react";
import { ReferralSettingsDialog } from "./ReferralSettingsDialog";
import type { ReferralCode, ReferralCodeStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ApiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ReferralCodesCardProps {
  referralCodes: ReferralCode[];
}

export function ReferralCodesCard({ referralCodes }: ReferralCodesCardProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState({
    codeType: "promotional" as const,
    belongsTo: "",
    code: "",
    expiresAt: "",
    friendRewardValue: "",
    referrerRewardValue: "",
    minimumOrderAmount: "",
    maxUses: "",
    isActive: true,
  });

  const getStatusColor = (status: ReferralCodeStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "maxed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "disabled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateCode = async () => {
    if (!newCode.belongsTo && !newCode.code) {
      toast({
        title: "Error",
        description: "Either 'Belongs To' or custom code is required for promotional codes",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const payload: any = {
        codeType: newCode.codeType,
      };

      if (newCode.belongsTo) payload.belongsTo = newCode.belongsTo;
      if (newCode.code) payload.code = newCode.code;
      if (newCode.friendRewardValue) payload.friendRewardValue = parseFloat(newCode.friendRewardValue);
      if (newCode.referrerRewardValue) payload.referrerRewardValue = parseFloat(newCode.referrerRewardValue);
      if (newCode.minimumOrderAmount) payload.minimumOrderAmount = parseFloat(newCode.minimumOrderAmount);
      if (newCode.maxUses) payload.maxUses = parseInt(newCode.maxUses);
      if (newCode.expiresAt) payload.expiresAt = new Date(newCode.expiresAt).toISOString();

      await ApiService.createReferralCode(payload);

      toast({
        title: "Success",
        description: "Promotional code created successfully. Refresh to see it.",
      });

      setIsCreateDialogOpen(false);
      setNewCode({
        codeType: "promotional" as const,
        belongsTo: "",
        code: "",
        expiresAt: "",
        friendRewardValue: "",
        referrerRewardValue: "",
        minimumOrderAmount: "",
        maxUses: "",
        isActive: true,
      });
    } catch (error: any) {
      console.error("Failed to create referral code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create referral code",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };


  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Referral Codes ({referralCodes.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Code
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Promotional Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="belongsTo">Belongs To</Label>
                <Input
                  id="belongsTo"
                  value={newCode.belongsTo}
                  onChange={(e) => setNewCode({...newCode, belongsTo: e.target.value})}
                  placeholder="e.g., Students, VIP Customers, Welcome Offer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describes who this promotional code is for
                </p>
              </div>

              <div>
                <Label htmlFor="code">Custom Code (Optional)</Label>
                <Input
                  id="code"
                  value={newCode.code}
                  onChange={(e) => setNewCode({...newCode, code: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="friendReward">Friend Reward (£)</Label>
                  <Input
                    id="friendReward"
                    type="number"
                    step="0.5"
                    value={newCode.friendRewardValue}
                    onChange={(e) => setNewCode({...newCode, friendRewardValue: e.target.value})}
                    placeholder="Uses default"
                  />
                </div>
                <div>
                  <Label htmlFor="referrerReward">Referrer Reward (£)</Label>
                  <Input
                    id="referrerReward"
                    type="number"
                    step="0.5"
                    value={newCode.referrerRewardValue}
                    onChange={(e) => setNewCode({...newCode, referrerRewardValue: e.target.value})}
                    placeholder="Uses default"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrder">Min Order (£)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    value={newCode.minimumOrderAmount}
                    onChange={(e) => setNewCode({...newCode, minimumOrderAmount: e.target.value})}
                    placeholder="Uses default"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={newCode.maxUses}
                    onChange={(e) => setNewCode({...newCode, maxUses: e.target.value})}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode({...newCode, expiresAt: e.target.value})}
                />
              </div>

              <Button onClick={handleCreateCode} className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Referral Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Belongs To</TableHead>
                <TableHead className="font-semibold">Friend Reward</TableHead>
                <TableHead className="font-semibold">Referrer Reward</TableHead>
                <TableHead className="font-semibold">Uses</TableHead>
                <TableHead className="font-semibold">Successful</TableHead>
                <TableHead className="font-semibold">Total Rewards</TableHead>
                <TableHead className="font-semibold">Expires</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralCodes.map((code) => (
                <TableRow key={code.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-black hover:text-primary transition-colors cursor-pointer">
                    {code.code}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(code.status)}>
                      {code.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.belongsTo || '-'}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    £{code.friendRewardValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    £{code.referrerRewardValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.totalUses}{code.maxUses ? ` / ${code.maxUses}` : ''}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.successfulReferrals}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    £{code.totalRewardsEarned.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(code.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Referral Settings Dialog */}
      <ReferralSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </Card>
  );
}