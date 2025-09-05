import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { UserCard } from "./UserCard";
import { NotesSection } from "./NotesSection";
import { MetricsCards } from "./MetricsCards";
import { AccountAssociations } from "./AccountAssociations";
import { Button } from "@/components/ui/button";
import { LogOut, User, Store, Truck } from "lucide-react";
import syuzanaImage from "@/assets/syuzana-real.png";
import aliImage from "@/assets/ali-real.png";
import trilogyImage from "@/assets/trilogy.png";

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: string;
}

export function AdminDashboard({ onLogout, currentUser }: AdminDashboardProps) {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchType, setSearchType] = useState<string>("");

  const handleSearch = (query: string, type: string) => {
    setSearchType(type);
    
    // Search logic based on query and type
    if (type === "user") {
      // Check if searching for Syuzana by any identifier
      const syuzanaMatches = query.toLowerCase().includes("syuzana") || 
                            query.includes("syuzana@street.london") || 
                            query.includes("+447542016022") ||
                            query.includes("USR001") ||
                            query.includes("uid_syuzana_001_2024");
      
      // Check if searching for Ali by any identifier  
      const aliMatches = query.toLowerCase().includes("ali") || 
                        query.includes("ali@street.london") || 
                        query.includes("+447770237011") ||
                        query.includes("USR002") ||
                        query.includes("uid_ali_002_2024");

      if (syuzanaMatches) {
        setSearchResults({
          id: "USR001",
          name: "Syuzana O",
          email: "syuzana@street.london",
          phone: "+447542016022",
          avatar: syuzanaImage,
          status: "Active",
          joinDate: "2024-01-15",
          totalOrders: 47,
          totalSpent: 2840.50,
          deviceId: "DEV_iPhone_15_Pro_Max_001",
          uid: "uid_syuzana_001_2024"
        });
      } else if (aliMatches) {
        setSearchResults({
          id: "USR002",
          name: "Ali Al Nasiri",
          email: "ali@street.london",
          phone: "+447770237011",
          avatar: aliImage,
          status: "Active",
          joinDate: "2024-02-20",
          totalOrders: 23,
          totalSpent: 1450.75,
          deviceId: "DEV_Samsung_Galaxy_S24_001",
          uid: "uid_ali_002_2024"
        });
      }
    } else if (type === "retail") {
      const trilogyMatches = query.toLowerCase().includes("trilogy") ||
                            query.includes("info@trilogylondon.com") ||
                            query.includes("020 7937 7972") ||
                            query.includes("RET001") ||
                            query.includes("uid_trilogy_ret_001_2023");
      
      if (trilogyMatches) {
        setSearchResults({
          id: "RET001",
          name: "Trilogy London",
          email: "info@trilogylondon.com",
          phone: "020 7937 7972",
          avatar: trilogyImage,
          status: "Active",
          joinDate: "2023-08-20",
          totalOrders: 234,
          totalRevenue: 15680.75,
          deviceId: "DEV_iPad_Pro_Retail_001",
          uid: "uid_trilogy_ret_001_2023",
          address: "22 Kensington Church St, London W8 4EP",
          contact: "Lee",
          category: "Clothing"
        });
      }
    } else if (type === "courier") {
      const aliCourierMatches = query.toLowerCase().includes("ali") ||
                               query.includes("ali@street.london") ||
                               query.includes("+447770237011") ||
                               query.includes("COU001") ||
                               query.includes("uid_ali_cou_001_2024");
      
      if (aliCourierMatches) {
        setSearchResults({
          id: "COU001",
          name: "Ali Al Nasiri",
          email: "ali@street.london",
          phone: "+447770237011",
          avatar: aliImage,
          status: "Online",
          joinDate: "2024-03-10",
          totalDeliveries: 156,
          averageRating: 4.8,
          deviceId: "DEV_Samsung_Galaxy_Courier_001",
          uid: "uid_ali_cou_001_2024"
        });
      }
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
            <AccountAssociations data={searchResults} type={searchType} />
            
            {/* Notes Section */}
            <NotesSection entityId={searchResults.id} entityName={searchResults.name} entityType={searchType} />
          </div>
        )}

        {/* Default State */}
        {!searchResults && (
          <div className="text-center py-20">
            <div className="street-logo text-8xl text-muted-foreground/20 mb-4">STREET</div>
            <h2 className="street-title text-2xl text-muted-foreground mb-2">Welcome to STREET admin {currentUser}</h2>
            <p className="text-muted-foreground mb-8">Use the search bar above to find users, retailers, or couriers</p>
          </div>
        )}
      </div>
    </div>
  );
}