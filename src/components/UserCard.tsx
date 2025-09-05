import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Star, TrendingUp, Camera, Package, ChevronRight, DollarSign, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrdersDialog } from "@/components/OrdersDialog";
import { InvoicesDialog } from "@/components/InvoicesDialog";

interface UserCardProps {
  data: any;
  type: string;
}

export function UserCard({ data, type }: UserCardProps) {
  const [avatarUrl, setAvatarUrl] = useState(data.avatar);
  const [isHovering, setIsHovering] = useState(false);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sample orders data - in a real app this would come from props or API
  const sampleOrders = [
    {
      id: "ORD-001",
      amount: 45.99,
      location: "Downtown Plaza",
      dateTime: "2024-09-05T10:30:00Z",
      status: "delivered",
      rating: 5,
      items: ["Burger", "Fries", "Coke"]
    },
    {
      id: "ORD-002", 
      amount: 28.50,
      location: "Mall Food Court",
      dateTime: "2024-09-04T15:45:00Z",
      status: "delivered",
      rating: 4,
      items: ["Pizza", "Garlic Bread"]
    },
    {
      id: "ORD-003",
      amount: 62.75,
      location: "Business District",
      dateTime: "2024-09-03T12:20:00Z", 
      status: "completed",
      rating: 5,
      items: ["Sushi Set", "Miso Soup", "Green Tea"]
    },
    {
      id: "ORD-004",
      amount: 35.25,
      location: "University Campus",
      dateTime: "2024-09-02T18:15:00Z",
      status: "delivered", 
      rating: 3,
      items: ["Sandwich", "Salad", "Juice"]
    },
    {
      id: "ORD-005",
      amount: 52.00,
      location: "Shopping Center",
      dateTime: "2024-09-01T14:30:00Z",
      status: "delivered",
      rating: 4,
      items: ["Pasta", "Caesar Salad", "Wine"]
    },
    {
      id: "ORD-006",
      amount: 23.99,
      location: "City Center",
      dateTime: "2024-08-31T11:45:00Z",
      status: "cancelled",
      items: ["Coffee", "Pastry"]
    },
    {
      id: "ORD-007",
      amount: 78.50,
      location: "Riverside District", 
      dateTime: "2024-08-30T19:20:00Z",
      status: "delivered",
      rating: 5,
      items: ["Steak", "Sides", "Dessert"]
    }
  ];

  const recentOrders = sampleOrders.slice(0, 3);

  // Sample invoices data for retailers
  const sampleInvoices = [
    {
      id: "INV-001",
      amount: 1250.00,
      paidAmount: 1250.00,
      dateTime: "2024-09-05T09:00:00Z",
      status: "paid" as const,
      description: "Monthly commission payout"
    },
    {
      id: "INV-002", 
      amount: 850.75,
      paidAmount: 425.38,
      dateTime: "2024-09-04T14:30:00Z",
      status: "partial" as const,
      description: "Weekly order commissions"
    },
    {
      id: "INV-003",
      amount: 2100.50,
      paidAmount: 0,
      dateTime: "2024-09-03T11:15:00Z",
      status: "pending" as const,
      description: "Bi-weekly settlement"
    },
    {
      id: "INV-004",
      amount: 675.25,
      paidAmount: 675.25,
      dateTime: "2024-09-02T16:45:00Z",
      status: "paid" as const,
      description: "Order processing fees"
    },
    {
      id: "INV-005",
      amount: 950.00,
      paidAmount: 0,
      dateTime: "2024-08-30T08:20:00Z",
      status: "overdue" as const,
      description: "Late payment - August commissions"
    }
  ];

  const recentInvoices = sampleInvoices.slice(0, 5);

  const handleSave = () => {
    // In a real app, this would save to API
    Object.assign(data, editData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Changes have been saved successfully.",
    });
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  const updateEditData = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        toast({
          title: "Avatar Updated",
          description: "Profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "blocked":
        return "bg-red-900/10 text-red-900 border-red-900/20";
      case "withdrawn":
        return "bg-red-100 text-red-800 border-red-200";
      case "onboarding":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "online":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div 
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Avatar className="w-20 h-20 ring-4 ring-primary/20">
                <AvatarImage src={avatarUrl} alt={editData.name} />
                <AvatarFallback className="text-lg font-bold bg-primary/10">
                  {getInitials(editData.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Hover Overlay with Edit Button */}
              {isHovering && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-all duration-200">
                  <Button
                    onClick={triggerFileUpload}
                    size="sm"
                    className="bg-white/90 hover:bg-white text-black p-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => updateEditData('name', e.target.value)}
                    className="text-2xl font-bold street-title h-auto border-0 px-0 focus-visible:ring-0"
                  />
                ) : (
                  <h3 className="street-title text-2xl">{editData.name}</h3>
                )}
                
                {isEditing ? (
                  <Select value={editData.status} onValueChange={(value) => updateEditData('status', value)}>
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {type === "retail" ? (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge 
                    className={`${getStatusColor(editData.status)} font-medium`}
                    variant="outline"
                  >
                    {editData.status}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <span className="font-medium">ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{editData.id}</code>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">UID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{editData.uid}</code>
                </p>
              </div>
            </div>
          </div>
          
          {/* Edit Controls */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm" className="h-8">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline" className="h-8">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="h-8">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contact Information */}
        {type === "retail" ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Contact & Business Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Email:</span>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => updateEditData('email', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.email}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Phone:</span>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => updateEditData('phone', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.phone}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Category:</span>
                  {isEditing ? (
                    <Input
                      value={editData.category || "Restaurant"}
                      onChange={(e) => updateEditData('category', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.category || "Restaurant"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Owner:</span>
                  {isEditing ? (
                    <Input
                      value={editData.owner || "John Doe"}
                      onChange={(e) => updateEditData('owner', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.owner || "John Doe"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">Joined {new Date(editData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">POC Manager:</span>
                  {isEditing ? (
                    <Input
                      value={editData.pocManager || "Sarah Johnson"}
                      onChange={(e) => updateEditData('pocManager', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.pocManager || "Sarah Johnson"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">Signed Up By:</span>
                  {isEditing ? (
                    <Input
                      value={editData.signedUpBy || "Umaan"}
                      onChange={(e) => updateEditData('signedUpBy', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.signedUpBy || "Umaan"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">POS System:</span>
                  {isEditing ? (
                    <Input
                      value={editData.posSystem || "Shopify"}
                      onChange={(e) => updateEditData('posSystem', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.posSystem || "Shopify"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">Commission:</span>
                  {isEditing ? (
                    <Input
                      value={editData.commissionRate || "10%"}
                      onChange={(e) => updateEditData('commissionRate', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm font-bold text-green-600">{editData.commissionRate || "10%"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  {isEditing ? (
                    <Input
                      value={editData.address || "63 Weymouth St, London W1G 8LS, United Kingdom"}
                      onChange={(e) => updateEditData('address', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.address || "63 Weymouth St, London W1G 8LS, United Kingdom"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-16">Email:</span>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => updateEditData('email', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-16">Phone:</span>
                  {isEditing ? (
                    <Input
                      value={editData.phone}
                      onChange={(e) => updateEditData('phone', e.target.value)}
                      className="text-sm h-8"
                    />
                  ) : (
                    <span className="text-sm">{editData.phone}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Joined {new Date(editData.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Contact Methods */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Contact Methods</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SMS Notifications:</span>
                  <span className="text-sm text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Notifications:</span>
                  <span className="text-sm text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Push Notifications:</span>
                  <span className="text-sm text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Marketing Communications:</span>
                  <span className="text-sm text-amber-600 font-medium">Disabled</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Orders Section */}
        {(type === "user" || type === "retail") && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Recent Orders</h4>
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">${order.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.dateTime).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => setOrdersDialogOpen(true)}
              >
                More Orders
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Payments Section for Retailers */}
        {type === "retail" && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Payments</h4>
            <div className="space-y-2">
              {recentInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">#{invoice.id}</p>
                      <p className="text-xs text-muted-foreground">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">${invoice.paidAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      <Badge 
                        className={`text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}
                        variant="outline"
                      >
                        {invoice.status}
                      </Badge>
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => setInvoicesDialogOpen(true)}
              >
                More Invoices
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Device Information */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Device Information</h4>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Device ID:</span> {data.deviceId}
          </p>
        </div>
      </CardContent>
      
      <OrdersDialog 
        open={ordersDialogOpen}
        onOpenChange={setOrdersDialogOpen}
        orders={sampleOrders}
        userType={type}
        userName={data.name}
      />
      
      <InvoicesDialog 
        open={invoicesDialogOpen}
        onOpenChange={setInvoicesDialogOpen}
        invoices={sampleInvoices}
        retailerName={data.name}
      />
    </Card>
  );
}