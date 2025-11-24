import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Star, Camera, Edit, Save, X, Mail, Phone, ExternalLink, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStatusColor, getInitials } from "@/utils/statusUtils";
import { TEAM_MEMBERS, RETAIL_STATUS_OPTIONS, USER_STATUS_OPTIONS, COURIER_STATUS_OPTIONS } from "@/constants";
import type { User, Retailer, Courier, EntityType, UserAddress, Device } from "@/types";
import { ApiService } from "@/services/api";

interface OverviewTabProps {
  data: User | Retailer | Courier;
  type: EntityType;
  onDataUpdate: (updatedData: any) => void;
}

export function OverviewTab({ data, type, onDataUpdate }: OverviewTabProps) {
  const [avatarUrl, setAvatarUrl] = useState(data.avatar);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(editData.joinDate).getTime()) / (1000 * 60 * 60 * 24)
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

  // Fetch devices for users
  useEffect(() => {
    if (type === 'user') {
      setIsLoadingDevices(true);
      ApiService.getUserDevices(data.id)
        .then(deviceData => setDevices(deviceData))
        .catch(err => console.error('Failed to load devices:', err))
        .finally(() => setIsLoadingDevices(false));
    }
  }, [data.id, type]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(data);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedData;

      if (type === 'user') {
        updatedData = await ApiService.updateUser(data.id, editData as User);
      } else if (type === 'retail') {
        updatedData = await ApiService.updateVendor(data.id, editData as Retailer);
      } else {
        updatedData = await ApiService.updateCourier(data.id, editData as Courier);
      }

      onDataUpdate(updatedData);
      setEditData(updatedData);
      setIsEditing(false);

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`,
      });
    } catch (error) {
      console.error('Failed to update:', error);
      toast({
        title: "Error",
        description: "Failed to update information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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

  const getDeviceDisplayName = (device: Device): string => {
    if (device.deviceName) return device.deviceName;

    const platformNames = {
      ios: 'iOS Device',
      android: 'Android Device',
      web: 'Web Browser'
    };
    return platformNames[device.platform] || 'Unknown Device';
  };

  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return "Never";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusOptions = () => {
    switch (type) {
      case "retail": return RETAIL_STATUS_OPTIONS;
      case "user": return USER_STATUS_OPTIONS;
      case "courier": return COURIER_STATUS_OPTIONS;
      default: return USER_STATUS_OPTIONS;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Avatar className="w-24 h-24 border-4 border-primary/20 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                  {getInitials(editData.name)}
                </AvatarFallback>
              </Avatar>
              {isHovering && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-2xl font-bold h-auto py-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-foreground">{editData.name}</h2>
                  )}
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions().map((status) => (
                            <SelectItem key={status} value={status.toLowerCase()}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(editData.status)}>
                        {editData.status.toUpperCase()}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {daysSinceJoined} days ago
                    </span>
                    {type === "courier" && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {(data as Courier).averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* ID and UID */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">ID:</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">{editData.id}</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">UID:</span>
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">{editData.uid}</code>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Email</label>
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{editData.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{editData.phone || "No phone"}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Type-specific fields */}
              {type === "retail" && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {isEditing ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Address</label>
                        <Input
                          value={(editData as Retailer).address}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Category</label>
                        <Input
                          value={(editData as Retailer).category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{(data as Retailer).address}</span>
                      </div>
                      {(data as Retailer).storeUrl && (
                        <a
                          href={(data as Retailer).storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">View Store</span>
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* SSO Provider for users */}
              {type === "user" && (data as User).ssoProvider && (
                <div className="pt-2">
                  <Badge variant="outline">
                    SSO: {(data as User).ssoProvider}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Addresses - Only for users */}
      {type === 'user' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              Saved Addresses
            </h3>
            {isLoadingAddresses ? (
              <p className="text-sm text-muted-foreground">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No saved addresses</p>
              </div>
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
          </CardContent>
        </Card>
      )}

      {/* Registered Devices - Only for users */}
      {type === 'user' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5" />
              Registered Devices
            </h3>
            {isLoadingDevices ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading devices...
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No devices registered</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div key={device.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{getDeviceDisplayName(device)}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatLastSeen(device.lastUsedAt)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Platform: </span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {device.platform}
                        </Badge>
                      </div>
                      {device.deviceId && (
                        <div className="flex items-center justify-between">
                          <span>Device ID: </span>
                          <span className="font-mono text-xs truncate max-w-[200px]">
                            {device.deviceId}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Status: </span>
                        <Badge variant={device.isActive ? "default" : "outline"} className="text-xs">
                          {device.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
