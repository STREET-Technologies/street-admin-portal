import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Shield } from "lucide-react";
import { ApiService } from "@/services/api";
import type { Device } from "@/types";

interface AccountAssociationsProps {
  data: any;
  type?: string;
}

export function AccountAssociations({ data, type }: AccountAssociationsProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Fetch real device data for users
  useEffect(() => {
    if (type === 'user' && data?.id) {
      setIsLoadingDevices(true);
      ApiService.getUserDevices(data.id)
        .then(deviceData => setDevices(deviceData))
        .catch(err => console.error('Failed to load devices:', err))
        .finally(() => setIsLoadingDevices(false));
    }
  }, [data?.id, type]);

  const getDeviceDisplayName = (device: Device): string => {
    if (device.deviceName) return device.deviceName;

    // Fallback to platform name
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
    <div className="grid grid-cols-1 gap-6">
      {/* Device Information */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
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
            <div className="text-sm text-muted-foreground text-center py-4">
              No devices registered
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

      {/* Account Security */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
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