import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { UserCard } from "./UserCard";
import { NotesSection } from "./NotesSection";
import { MetricsCards } from "./MetricsCards";
import { AccountAssociations } from "./AccountAssociations";
import { Button } from "@/components/ui/button";
import { LogOut, User, Store, Truck } from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: string;
}

export function AdminDashboard({ onLogout, currentUser }: AdminDashboardProps) {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchType, setSearchType] = useState<string>("");

  const handleSearch = (query: string, type: string) => {
    setSearchType(type);
    // Mock data based on search type
    if (type === "user") {
      setSearchResults({
        id: "USR001",
        name: "Alex Johnson",
        email: "alex.johnson@gmail.com",
        phone: "+1 555-0123",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        status: "Active",
        joinDate: "2024-01-15",
        totalOrders: 47,
        totalSpent: 2840.50,
        deviceId: "DEV_iPhone_15_Pro_Max_001",
        uid: "uid_alex_001_2024"
      });
    } else if (type === "retail") {
      setSearchResults({
        id: "RET001",
        name: "Urban Style Boutique",
        email: "info@urbanstyle.com",
        phone: "+1 555-0456",
        avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
        status: "Active",
        joinDate: "2023-08-20",
        totalOrders: 234,
        totalRevenue: 15680.75,
        deviceId: "DEV_iPad_Pro_Retail_001",
        uid: "uid_urban_ret_001_2023"
      });
    } else if (type === "courier") {
      setSearchResults({
        id: "COU001",
        name: "Mike Rodriguez",
        email: "mike.courier@street.com",
        phone: "+1 555-0789",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        status: "Online",
        joinDate: "2024-03-10",
        totalDeliveries: 156,
        averageRating: 4.8,
        deviceId: "DEV_Samsung_Galaxy_Courier_001",
        uid: "uid_mike_cou_001_2024"
      });
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case "user": return <User className="w-5 h-5" />;
      case "retail": return <Store className="w-5 h-5" />;
      case "courier": return <Truck className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="street-logo text-3xl text-secondary">STREET</h1>
              <div className="w-8 h-0.5 street-gradient"></div>
              <span className="text-muted-foreground">Admin Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {currentUser}</span>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="space-y-8">
            {/* User Info Card */}
            <div className="flex items-center gap-3 mb-6">
              {getSearchIcon()}
              <h2 className="street-title text-2xl capitalize">{searchType} Information</h2>
            </div>
            
            <UserCard data={searchResults} type={searchType} />
            
            {/* Metrics */}
            <MetricsCards data={searchResults} type={searchType} />
            
            {/* Account Associations */}
            <AccountAssociations data={searchResults} />
            
            {/* Notes Section */}
            <NotesSection entityId={searchResults.id} entityName={searchResults.name} />
          </div>
        )}

        {/* Default State */}
        {!searchResults && (
          <div className="text-center py-20">
            <div className="street-logo text-8xl text-muted-foreground/20 mb-4">STREET</div>
            <h2 className="street-title text-2xl text-muted-foreground mb-2">Welcome to STREET Admin</h2>
            <p className="text-muted-foreground mb-8">Use the search bar above to find users, retailers, or couriers</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 rounded-lg border bg-white/50 backdrop-blur-sm">
                <User className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Search Users</h3>
                <p className="text-sm text-muted-foreground">Type <code className="bg-muted px-1 rounded">/user</code> to search customers</p>
              </div>
              
              <div className="p-6 rounded-lg border bg-white/50 backdrop-blur-sm">
                <Store className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Search Retailers</h3>
                <p className="text-sm text-muted-foreground">Type <code className="bg-muted px-1 rounded">/retail</code> to search stores</p>
              </div>
              
              <div className="p-6 rounded-lg border bg-white/50 backdrop-blur-sm">
                <Truck className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Search Couriers</h3>
                <p className="text-sm text-muted-foreground">Type <code className="bg-muted px-1 rounded">/courier</code> to search drivers</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}