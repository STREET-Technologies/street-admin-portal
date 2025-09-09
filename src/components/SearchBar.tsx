import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Store, Truck, Ticket } from "lucide-react";
import { SearchService } from "@/services/searchService";
import type { EntityType } from "@/types";

interface SearchBarProps {
  onSearch: (query: string, type: EntityType) => void;
  onTypeChange?: () => void;
}

export function SearchBar({ onSearch, onTypeChange }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EntityType>("user");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    const newSuggestions = SearchService.getSuggestions(value, selectedType);
    setSuggestions(newSuggestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      onSearch(query, selectedType);
    }
    
    setSuggestions([]);
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    onSearch(suggestion, selectedType);
  };

  const handleTypeChange = (newType: EntityType) => {
    setSelectedType(newType);
    setQuery("");
    setSuggestions([]);
    onTypeChange?.();
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Type Selection Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={selectedType === "user" ? "default" : "outline"}
          onClick={() => handleTypeChange("user")}
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          User
        </Button>
        <Button
          type="button"
          variant={selectedType === "retail" ? "default" : "outline"}
          onClick={() => handleTypeChange("retail")}
          className="flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          Retailer
        </Button>
        <Button
          type="button"
          variant={selectedType === "courier" ? "default" : "outline"}
          onClick={() => handleTypeChange("courier")}
          className="flex items-center gap-2"
        >
          <Truck className="w-4 h-4" />
          Courier
        </Button>
        <Button
          type="button"
          variant={selectedType === "referralcode" ? "default" : "outline"}
          onClick={() => handleTypeChange("referralcode")}
          className="flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          ReferralCodes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={selectedType === "referralcode" ? "Search referral codes by code, creator, or belongs to" : `Search ${selectedType} by name, email, phone or ID`}
            className="pr-24 h-14 text-lg border-2 focus:border-primary bg-white/95 backdrop-blur-sm"
          />
          <Button
            type="submit"
            className="absolute right-2 top-2 h-10 street-gradient text-black font-bold"
            disabled={!query.trim()}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3"
            >
              <User className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm">{suggestion}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {suggestion.includes("@") ? "Email" : 
                 suggestion.includes("+") ? "Phone" : 
                 suggestion.includes("uid_") ? "UID" : 
                 suggestion.match(/^[A-Z]{3}\d{3}$/) ? "ID" : "Name"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}