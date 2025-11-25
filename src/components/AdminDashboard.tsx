import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { UserCard } from "./UserCard";
import { SettingsPanel } from "./SettingsPanel";
import { Button } from "@/components/ui/button";
import { LogOut, User, Store, Truck } from "lucide-react";
import { SearchService } from "@/services/searchService";
import type { SearchResult, EntityType } from "@/types";

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: string;
}

export function AdminDashboard({ onLogout, currentUser }: AdminDashboardProps) {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchType, setSearchType] = useState<EntityType | "">("");

  const handleSearch = async (query: string, type: EntityType) => {
    setSearchType(type);
    setSearchResults(null);

    const result = await SearchService.search(query, type);
    setSearchResults(result);
  };

  const handleTypeChange = () => {
    setSearchResults(null);
    setSearchType("");
  };

  const handleLogoClick = () => {
    setSearchResults(null);
    setSearchType("");
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
              <img
                src="/img/logo-green-transparent.png"
                alt="STREET Logo"
                className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              />
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
          <SearchBar onSearch={handleSearch} onTypeChange={handleTypeChange} />
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="space-y-8">
            {/* Handle different entity types */}
            {searchResults.type === "settings" ? (
              <SettingsPanel />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  {getSearchIcon()}
                  <h2 className="street-title text-2xl capitalize">{searchType} Information</h2>
                </div>

                <UserCard
                  data={searchResults.data as any}
                  type={searchResults.type}
                />
              </>
            )}
          </div>
        )}

        {/* Default State */}
        {!searchResults && (
          <div className="text-center py-20">
            <img
              src="/img/logo-green-transparent.png"
              alt="STREET Logo"
              className="h-24 mx-auto mb-4 opacity-50"
            />
            <h2 className="street-title text-2xl text-muted-foreground mb-2">Welcome to STREET admin {currentUser}</h2>
            <p className="text-muted-foreground mb-8">Use the search bar above to find users, retailers, or couriers, or access settings</p>

            <div className="max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-medium">Compliance Notice:</span> Access to this portal is restricted to authorised employees for legitimate business purposes only. Unauthorised access or misuse of user information may result in disciplinary action and legal consequences.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
