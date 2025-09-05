import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, TrendingUp, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserCardProps {
  data: any;
  type: string;
}

export function UserCard({ data, type }: UserCardProps) {
  const [avatarUrl, setAvatarUrl] = useState(data.avatar);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      case "online":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
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
        <div className="flex items-start gap-4">
          <div 
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Avatar className="w-20 h-20 ring-4 ring-primary/20">
              <AvatarImage src={avatarUrl} alt={data.name} />
              <AvatarFallback className="text-lg font-bold bg-primary/10">
                {getInitials(data.name)}
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
              <h3 className="street-title text-2xl">{data.name}</h3>
              <Badge 
                className={`${getStatusColor(data.status)} font-medium`}
                variant="outline"
              >
                {data.status}
              </Badge>
            </div>
            
            <div className="space-y-1 text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-medium">ID:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm">{data.id}</code>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">UID:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm">{data.uid}</code>
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">
              {type === "retail" ? "Contact & Business Information" : "Contact Information"}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-16">Email:</span>
                <span className="text-sm">{data.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-16">Phone:</span>
                <span className="text-sm">{data.phone}</span>
              </div>
              {type === "retail" && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-16">Category:</span>
                    <span className="text-sm">{data.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Business Location</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Joined {new Date(data.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Performance</h4>
            <div className="space-y-2">
              {type === "user" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Orders:</span>
                    <span className="text-sm font-bold">{data.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Spent:</span>
                    <span className="text-sm font-bold text-green-600">${data.totalSpent.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              {type === "retail" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Orders:</span>
                    <span className="text-sm font-bold">{data.totalOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Revenue:</span>
                    <span className="text-sm font-bold text-green-600">${data.totalRevenue.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              {type === "courier" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deliveries:</span>
                    <span className="text-sm font-bold">{data.totalDeliveries}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{data.averageRating}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Device Information */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Device Information</h4>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Device ID:</span> {data.deviceId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}