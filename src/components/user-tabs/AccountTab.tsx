import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Smartphone, Shield, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiService } from "@/services/api";
import type { UserAddress, Device, EntityType } from "@/types";

interface AccountTabProps {
  entityId: string;
  entityType: EntityType;
}

export function AccountTab({ entityId, entityType }: AccountTabProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const { toast } = useToast();

  // Fetch user addresses for users
  useEffect(() => {
    if (entityType === 'user') {
      setIsLoadingAddresses(true);
      ApiService.getUserAddresses(entityId)
        .then(setAddresses)
        .catch(err => console.error('Failed to load addresses:', err))
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [entityId, entityType]);

  // Fetch devices for users
  useEffect(() => {
    if (entityType === 'user') {
      setIsLoadingDevices(true);
      ApiService.getUserDevices(entityId)
        .then(deviceData => setDevices(deviceData))
        .catch(err => console.error('Failed to load devices:', err))
        .finally(() => setIsLoadingDevices(false));
    }
  }, [entityId, entityType]);

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
        entityId,
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

  return (
    <div className="space-y-6">
      {/* Saved Addresses - Only for users */}
      {entityType === 'user' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Saved Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
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

      {/* Device Information - Only for users */}
      {entityType === 'user' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Registered Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              devices.map((device) => (
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
              ))
            )}
          </CardContent>
        </Card>
      )}

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
