import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket, Plus, Calendar, CreditCard, User, Users, Clock } from "lucide-react";
import type { ReferralCode, ReferralCodeStatus } from "@/types";
import { TEAM_MEMBERS } from "@/constants";
import { formatDistanceToNow } from "date-fns";

interface ReferralCodesCardProps {
  referralCodes: ReferralCode[];
}

export function ReferralCodesCard({ referralCodes }: ReferralCodesCardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    expiryDate: "",
    creditAmount: "",
    freeDeliveries: "",
    belongsTo: "",
    createdBy: "Ali Al Nasiri"
  });

  const getStatusColor = (status: ReferralCodeStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "used":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "disabled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateCode = () => {
    // Here you would typically send the data to your backend
    console.log("Creating new referral code:", newCode);
    setIsCreateDialogOpen(false);
    setNewCode({
      code: "",
      expiryDate: "",
      creditAmount: "",
      freeDeliveries: "",
      belongsTo: "",
      createdBy: "Ali Al Nasiri"
    });
  };

  const formatCreditInfo = (code: ReferralCode) => {
    if (code.creditAmount) {
      return `£${code.creditAmount} credit`;
    }
    if (code.freeDeliveries) {
      return `${code.freeDeliveries} free deliveries`;
    }
    return "No credit info";
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Referral Codes ({referralCodes.length})
        </CardTitle>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Referral Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={newCode.code}
                  onChange={(e) => setNewCode({...newCode, code: e.target.value})}
                  placeholder="Enter referral code"
                />
              </div>
              
              <div>
                <Label htmlFor="belongsTo">Belongs To</Label>
                <Input
                  id="belongsTo"
                  value={newCode.belongsTo}
                  onChange={(e) => setNewCode({...newCode, belongsTo: e.target.value})}
                  placeholder="e.g., Annie, Students, VIP Customers"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCode.expiryDate}
                  onChange={(e) => setNewCode({...newCode, expiryDate: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creditAmount">Credit Amount (£)</Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    value={newCode.creditAmount}
                    onChange={(e) => setNewCode({...newCode, creditAmount: e.target.value, freeDeliveries: ""})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="freeDeliveries">Free Deliveries</Label>
                  <Input
                    id="freeDeliveries"
                    type="number"
                    value={newCode.freeDeliveries}
                    onChange={(e) => setNewCode({...newCode, freeDeliveries: e.target.value, creditAmount: ""})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="createdBy">Created By</Label>
                <Select 
                  value={newCode.createdBy} 
                  onValueChange={(value) => setNewCode({...newCode, createdBy: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateCode} className="w-full">
                Create Referral Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Credit/Deliveries</TableHead>
                <TableHead className="font-semibold">Expires</TableHead>
                <TableHead className="font-semibold">Created By</TableHead>
                <TableHead className="font-semibold">Belongs To</TableHead>
                <TableHead className="font-semibold">Used By</TableHead>
                <TableHead className="font-semibold">Used Date</TableHead>
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
                    {formatCreditInfo(code)}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {new Date(code.expiryDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.createdBy}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.belongsTo}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.usedBy || "-"}
                  </TableCell>
                  <TableCell className="text-black hover:text-primary transition-colors">
                    {code.usedDate ? formatDistanceToNow(new Date(code.usedDate), { addSuffix: true }) : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(code.createdDate), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}