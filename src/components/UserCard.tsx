import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Star, TrendingUp, Camera, Package, ChevronRight, DollarSign, Edit, Save, X, Mail, Phone, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrdersDialog } from "@/components/OrdersDialog";
import { InvoicesDialog } from "@/components/InvoicesDialog";
import { mockOrders, mockInvoices } from "@/data/mockData";
import { getStatusColor, getInitials } from "@/utils/statusUtils";
import { TEAM_MEMBERS, RETAIL_STATUS_OPTIONS, USER_STATUS_OPTIONS, COURIER_STATUS_OPTIONS } from "@/constants";
import type { User, Retailer, Courier, EntityType, UserAddress, Order } from "@/types";
import { ApiService } from "@/services/api";

interface UserCardProps {
  data: User | Retailer | Courier;
  type: EntityType;
  onUserDataEnriched?: (totalOrders: number, totalSpent: number) => void;
}

export function UserCard({ data, type, onUserDataEnriched }: UserCardProps) {
  const [avatarUrl, setAvatarUrl] = useState(data.avatar);
  const [isHovering, setIsHovering] = useState(false);
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast} = useToast();

  // Use clean mock data for invoices
  const recentInvoices = mockInvoices.slice(0, 3);

  // Calculate order statistics
  const totalSpent = orders.reduce((sum, order) => {
    const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

  // Calculate days since joined
  const daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(editData.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get recent orders (first 3)
  const recentOrders = orders.slice(0, 3);

  // Filter orders for dialog - only DELIVERED and CANCELLED
  const filteredOrdersForDialog = orders.filter(order =>
    order.status === 'DELIVERED' || order.status === 'CANCELLED'
  );

  // Fetch user addresses for users
  useEffect(() => {
    if (type === 'user') {
      setIsLoadingAddresses(true);
      ApiService.getUserAddresses(data.id)
        .then(setAddresses)
        .catch(err => console.error('Failed to load addresses:', err))
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [data.id, type]);

  // Fetch user orders for users
  useEffect(() => {
    if (type === 'user') {
      setIsLoadingOrders(true);
      ApiService.getUserOrders(data.id, 100, 1)  // Fetch all orders for stats
        .then(response => {
          setOrders(response.orders);
          setTotalOrders(response.meta.total);

          // Calculate total spent from orders
          const spent = response.orders.reduce((sum, order) => {
            const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

          // Notify parent component of enriched data for MetricsCards
          if (onUserDataEnriched) {
            onUserDataEnriched(response.meta.total, spent);
          }
        })
        .catch(err => console.error('Failed to load orders:', err))
        .finally(() => setIsLoadingOrders(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id, type]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedData;

      if (type === "retail") {
        updatedData = await ApiService.updateVendor(data.id, editData as Retailer);
      } else if (type === "user") {
        updatedData = await ApiService.updateUser(data.id, editData as User);
      } else if (type === "courier") {
        updatedData = await ApiService.updateCourier(data.id, editData as Courier);
      }

      if (updatedData) {
        // Update local data with the response from backend
        Object.assign(data, updatedData);
        setEditData(updatedData);
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Changes have been saved successfully to the database.",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddressId(address.id);
    setEditingAddress({ ...address });
  };

  const handleCancelAddressEdit = () => {
    setEditingAddressId(null);
    setEditingAddress(null);
  };

  const handleSaveAddress = async () => {
    if (!editingAddress || !editingAddressId) return;

    setIsSavingAddress(true);
    try {
      const updated = await ApiService.updateUserAddress(
        data.id,
        editingAddressId,
        editingAddress
      );

      // Update the addresses list with the updated address
      setAddresses(prev =>
        prev.map(addr => (addr.id === editingAddressId ? updated : addr))
      );

      setEditingAddressId(null);
      setEditingAddress(null);

      toast({
        title: "Address Updated",
        description: "Address has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save address:", error);
      toast({
        title: "Update Failed",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const updateAddressField = (field: keyof UserAddress, value: any) => {
    if (!editingAddress) return;
    setEditingAddress(prev => prev ? { ...prev, [field]: value } : null);
  };

  const isRetailer = (entity: User | Retailer | Courier): entity is Retailer => {
    return type === 'retail';
  };

  const isUser = (entity: User | Retailer | Courier): entity is User => {
    return type === 'user';
  };

  const isCourier = (entity: User | Retailer | Courier): entity is Courier => {
    return type === 'courier';
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
              {type === 'retail' ? (
                // Rounded rectangle for retailer logos
                <div className="w-24 h-24 ring-4 ring-primary/20 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={editData.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-lg font-bold bg-primary/10 w-full h-full flex items-center justify-center rounded">
                      {getInitials(editData.name)}
                    </div>
                  )}
                </div>
              ) : (
                // Keep circular avatar for users and couriers
                <Avatar className="w-20 h-20 ring-4 ring-primary/20">
                  <AvatarImage src={avatarUrl} alt={editData.name} />
                  <AvatarFallback className="text-lg font-bold bg-primary/10">
                    {getInitials(editData.name)}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Hover Overlay with Edit Button */}
              {isHovering && (
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-200 ${type === 'retail' ? 'rounded-lg' : 'rounded-full'}`}>
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
                        RETAIL_STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))
                      ) : type === "courier" ? (
                        COURIER_STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))
                      ) : (
                        USER_STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge 
                    className={`${getStatusColor(editData.status as any)} font-medium`}
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
                {type === 'retail' && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Store URL:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{editData.uid}</code>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined {new Date(editData.joinDate).toLocaleDateString()}</span>
                </p>
                {type === 'retail' && isRetailer(editData) && (
                  <p className="flex items-start gap-2 pt-1">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 space-y-1">
                        <Input
                          value={editData.address || ""}
                          onChange={(e) => updateEditData('address', e.target.value)}
                          className="text-sm h-7"
                          placeholder="Street address"
                        />
                        <Input
                          value={editData.postcode || ""}
                          onChange={(e) => updateEditData('postcode', e.target.value)}
                          className="text-sm h-7 w-32"
                          placeholder="Postcode"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        {editData.address || editData.postcode ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${editData.address}${editData.address && editData.postcode ? ', ' : ''}${editData.postcode || ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1.5"
                          >
                            <span>{editData.address}{editData.address && editData.postcode ? ', ' : ''}{editData.postcode}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not available</span>
                        )}
                      </div>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit Controls */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} size="sm" className="h-8" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button onClick={handleCancel} size="sm" variant="outline" className="h-8" disabled={isSaving}>
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
        {/* Contact Information & Saved Addresses */}
        {type === "retail" && isRetailer(editData) ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Contact & Business Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Email:</span>
                  <div className="flex flex-col gap-1">
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editData.email}
                        onChange={(e) => updateEditData('email', e.target.value)}
                        className="text-sm h-8"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{editData.email}</span>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Primary
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Phone:</span>
                  <div className="flex flex-col gap-1">
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => updateEditData('phone', e.target.value)}
                        className="text-sm h-8"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{editData.phone}</span>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Primary
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                          Unverified
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Category:</span>
                  {isEditing ? (
                    <Input
                      value={editData.category || ""}
                      onChange={(e) => updateEditData('category', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{editData.category || "Not available"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Owner:</span>
                  {isEditing ? (
                    <Input
                      value={editData.owner || ""}
                      onChange={(e) => updateEditData('owner', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{editData.owner || "Not available"}</span>
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
                      value={editData.pocManager || ""}
                      onChange={(e) => updateEditData('pocManager', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{editData.pocManager || "Not available"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">Signed Up By:</span>
                  {isEditing ? (
                    <Select value={editData.signedUpBy || ""} onValueChange={(value) => updateEditData('signedUpBy', value)}>
                      <SelectTrigger className="w-40 bg-background text-sm h-8">
                        <SelectValue placeholder="Not available" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {TEAM_MEMBERS.map(member => (
                          <SelectItem key={member} value={member}>{member}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-muted-foreground">{editData.signedUpBy || "Not available"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">POS System:</span>
                  {isEditing ? (
                    <Input
                      value={editData.posSystem || ""}
                      onChange={(e) => updateEditData('posSystem', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{editData.posSystem || "Not available"}</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-24">Commission:</span>
                  {isEditing ? (
                    <Input
                      value={editData.commissionRate || ""}
                      onChange={(e) => updateEditData('commissionRate', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{editData.commissionRate || "Not available"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Email:</span>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) => updateEditData('email', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{editData.email || "Not available"}</span>
                        {editData.email && (
                          <>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Primary
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Verified
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium w-20">Phone:</span>
                  {isEditing ? (
                    <Input
                      value={editData.phone || ""}
                      onChange={(e) => updateEditData('phone', e.target.value)}
                      className="text-sm h-8"
                      placeholder="Not available"
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{editData.phone || "Not available"}</span>
                        {editData.phone && (
                          <>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Primary
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Verified
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isUser(editData) && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium w-20">Sign Up:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {editData.ssoProvider ? editData.ssoProvider.charAt(0).toUpperCase() + editData.ssoProvider.slice(1) : 'OTP'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {editData.ssoProvider ? 'SSO' : 'Phone'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {isCourier(editData) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-600">{editData.averageRating}/5.0 rating</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Two-column layout for Saved Addresses and Recent Activity on users */}
        {type === 'user' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saved Addresses - Left Column */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Saved Addresses
              </h4>
              {isLoadingAddresses ? (
                <p className="text-sm text-muted-foreground">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved addresses</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => {
                    const isEditingThis = editingAddressId === address.id;
                    const displayAddress = isEditingThis ? editingAddress : address;

                    if (!displayAddress) return null;

                    return (
                      <Card key={address.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {isEditingThis ? (
                                <Input
                                  value={displayAddress.label}
                                  onChange={(e) => updateAddressField('label', e.target.value)}
                                  className="h-7 text-sm font-medium"
                                />
                              ) : (
                                <span className="font-medium">{displayAddress.label}</span>
                              )}
                              {displayAddress.isDefault && (
                                <Badge variant="default" className="text-xs">Default</Badge>
                              )}
                            </div>
                            {!isEditingThis ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAddress(address)}
                                className="h-7 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleSaveAddress}
                                  disabled={isSavingAddress}
                                  className="h-7 px-2"
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelAddressEdit}
                                  disabled={isSavingAddress}
                                  className="h-7 px-2"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-2">
                            {isEditingThis ? (
                              <>
                                <Input
                                  value={displayAddress.line1}
                                  onChange={(e) => updateAddressField('line1', e.target.value)}
                                  placeholder="Address Line 1"
                                  className="h-8 text-sm"
                                />
                                <Input
                                  value={displayAddress.line2 || ''}
                                  onChange={(e) => updateAddressField('line2', e.target.value)}
                                  placeholder="Address Line 2 (optional)"
                                  className="h-8 text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    value={displayAddress.city}
                                    onChange={(e) => updateAddressField('city', e.target.value)}
                                    placeholder="City"
                                    className="h-8 text-sm"
                                  />
                                  <Input
                                    value={displayAddress.state}
                                    onChange={(e) => updateAddressField('state', e.target.value)}
                                    placeholder="State"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    value={displayAddress.postcode}
                                    onChange={(e) => updateAddressField('postcode', e.target.value)}
                                    placeholder="Postcode"
                                    className="h-8 text-sm"
                                  />
                                  <Input
                                    value={displayAddress.country}
                                    onChange={(e) => updateAddressField('country', e.target.value)}
                                    placeholder="Country"
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <p>{displayAddress.line1}</p>
                                {displayAddress.line2 && <p>{displayAddress.line2}</p>}
                                <p>{displayAddress.city}, {displayAddress.state}</p>
                                <p>{displayAddress.postcode}, {displayAddress.country}</p>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity - Right Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-3">
                <Package className="w-5 h-5" />
                Recent Activity
              </h4>

              <div className="space-y-6">
            {/* Recent Orders */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Recent Orders</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrdersDialogOpen(true)}
                    className="text-foreground hover:text-foreground/80"
                  >
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
                      return (
                        <div key={order.id} className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{order.orderId}</span>
                              <Badge
                                variant="outline"
                                className={getStatusColor(order.status as any)}
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.vendor?.storeName || 'Unknown vendor'} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">£{amount.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

                {/* Recent Invoices - Only for Users, not shown in this column */}
              </div>
            </div>
          </div>
        ) : (
          /* Recent Activity for non-user types (retail/courier) - Full width */
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-3">
              <Package className="w-5 h-5" />
              Recent Activity
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Recent Orders</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOrdersDialogOpen(true)}
                      className="text-foreground hover:text-foreground/80"
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <p className="text-sm text-muted-foreground">Loading orders...</p>
                  ) : recentOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order) => {
                        const amount = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount;
                        return (
                          <div key={order.id} className="flex items-center justify-between p-2 bg-background rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{order.orderId}</span>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(order.status as any)}
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {order.vendor?.storeName || 'Unknown vendor'} • {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">£{amount.toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Invoices - Only for Retailers */}
              {type === "retail" && (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Recent Invoices</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInvoicesDialogOpen(true)}
                        className="text-primary hover:text-primary/80"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentInvoices.map((invoice, index) => (
                        <div key={invoice.id} className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">#{invoice.id}</span>
                              <Badge
                                variant="outline"
                                className={getStatusColor(invoice.status as any)}
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{invoice.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">£{invoice.paidAmount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">of £{invoice.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <OrdersDialog
          open={ordersDialogOpen}
          onOpenChange={setOrdersDialogOpen}
          orders={filteredOrdersForDialog}
          userType={type}
          userName={editData.name}
        />
        
        <InvoicesDialog
          open={invoicesDialogOpen}
          onOpenChange={setInvoicesDialogOpen}
          invoices={mockInvoices}
          userType={type}
          userName={editData.name}
        />
      </CardContent>
    </Card>
  );
}