import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Star, Camera, Edit, Save, X, Mail, Phone, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStatusColor, getInitials } from "@/utils/statusUtils";
import { TEAM_MEMBERS, RETAIL_STATUS_OPTIONS, USER_STATUS_OPTIONS, COURIER_STATUS_OPTIONS } from "@/constants";
import type { User, Retailer, Courier, EntityType } from "@/types";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(editData.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  );

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

  const getStatusOptions = () => {
    switch (type) {
      case "retail": return RETAIL_STATUS_OPTIONS;
      case "user": return USER_STATUS_OPTIONS;
      case "courier": return COURIER_STATUS_OPTIONS;
      default: return USER_STATUS_OPTIONS;
    }
  };

  return (
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
  );
}
