import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Mail, 
  Phone, 
  Smartphone, 
  CreditCard, 
  MapPin, 
  Link as LinkIcon,
  ExternalLink,
  Shield,
  Users
} from "lucide-react";

interface AccountAssociationsProps {
  data: any;
  type?: string;
}

export function AccountAssociations({ data, type }: AccountAssociationsProps) {
  // Mock associated accounts data
  const associations = {
    emails: [
      { email: data.email, verified: true, primary: true },
      { email: "alex.work@company.com", verified: true, primary: false },
    ],
    phones: [
      { phone: data.phone, verified: true, primary: true },
      { phone: "+1 555-0124", verified: false, primary: false },
    ],
    devices: [
      { 
        id: data.deviceId, 
        type: "iPhone 15 Pro Max", 
        lastSeen: "2024-01-20T14:30:00Z",
        location: "New York, NY"
      },
      { 
        id: "DEV_iPad_Secondary_002", 
        type: "iPad Pro 12.9", 
        lastSeen: "2024-01-18T09:15:00Z",
        location: "New York, NY"
      },
    ],
    paymentMethods: [
      { type: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
      { type: "MasterCard", last4: "8888", expiry: "08/25", isDefault: false },
    ],
    addresses: [
      { 
        type: "Home", 
        address: "123 Main St, Apt 4B, New York, NY 10001",
        isDefault: true 
      },
      { 
        type: "Work", 
        address: "456 Business Ave, Suite 200, New York, NY 10002",
        isDefault: false 
      },
    ]
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Mock data for device associations
  const getDeviceAssociatedAccounts = (deviceId: string) => {
    const mockAssociations = {
      [data.deviceId]: [
        { 
          id: data.id, 
          name: data.name, 
          email: data.email, 
          type: "Primary User",
          lastUsed: "2024-01-20T14:30:00Z",
          status: "Active"
        },
        { 
          id: "USR002", 
          name: "Sarah Johnson", 
          email: "sarah@gmail.com", 
          type: "Secondary User",
          lastUsed: "2024-01-19T10:15:00Z",
          status: "Active"
        }
      ],
      "DEV_iPad_Secondary_002": [
        { 
          id: data.id, 
          name: data.name, 
          email: data.email, 
          type: "Primary User",
          lastUsed: "2024-01-18T09:15:00Z",
          status: "Active"
        }
      ]
    };
    
    return mockAssociations[deviceId] || [];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Device Information */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Registered Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {associations.devices.map((device, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{device.type}</span>
                <Badge variant="outline" className="text-xs">
                  {formatLastSeen(device.lastSeen)}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>ID: </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-xs text-primary hover:underline font-mono"
                      >
                        {device.id}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Accounts Associated with Device: {device.id}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Last Used</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getDeviceAssociatedAccounts(device.id).map((account, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono text-sm">{account.id}</TableCell>
                                <TableCell className="font-medium">{account.name}</TableCell>
                                <TableCell>{account.email}</TableCell>
                                <TableCell>
                                  <Badge variant={account.type === "Primary User" ? "default" : "outline"}>
                                    {account.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {formatLastSeen(account.lastUsed)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={account.status === "Active" ? "default" : "destructive"}>
                                    {account.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {device.location}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods - Hide for retailers */}
      {type !== "retail" && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {associations.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">{method.type} ****{method.last4}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{method.expiry}</span>
                  {method.isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Addresses - Hide for retailers */}
      {type !== "retail" && (
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Saved Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {associations.addresses.map((address, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{address.type}</span>
                  {address.isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{address.address}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Account Security */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account Security & Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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